"""
LLM Client

"""

import asyncio
import time
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from enum import Enum
import tiktoken
from tenacity import retry, stop_after_attempt, wait_exponential


class LLMProvider(Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    GROQ = "groq"
    GEMINI = "gemini"
    OPENROUTER = "openrouter"
    OLLAMA = "ollama"


class BaseLLMClient(ABC):
    """Base abstract class for all LLM clients with common functionality"""

    def __init__(self, api_key: Optional[str], model: str, max_retries: int = 3, rate_limit_rpm: int = 60):
        """
        Initialize base LLM client

        Args:
            api_key: API key for the provider
            model: Model name to use
            max_retries: Maximum number of retry attempts
            rate_limit_rpm: Rate limit in requests per minute
        """
        self.api_key = api_key
        self.model = model
        self.max_retries = max_retries
        self.rate_limit_rpm = rate_limit_rpm
        self.request_times: List[float] = []
        # Default tokenizer - subclasses can override
        self._encoding = tiktoken.get_encoding("cl100k_base")

    async def _apply_rate_limit(self):
        """Apply rate limiting to prevent exceeding API limits"""
        now = time.time()
        # Remove requests older than 1 minute
        self.request_times = [t for t in self.request_times if now - t < 60]

        if len(self.request_times) >= self.rate_limit_rpm:
            # Wait until oldest request is > 60 seconds old
            sleep_time = 60 - (now - self.request_times[0])
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
                self.request_times = self.request_times[1:]

        self.request_times.append(now)

    def count_tokens(self, text: str) -> int:
        """Count tokens using tiktoken (approximate for non-OpenAI models)"""
        return len(self._encoding.encode(text))

    @abstractmethod
    async def complete(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate completion from prompt"""
        pass

    @abstractmethod
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """Generate chat completion"""
        pass


class OpenAIClient(BaseLLMClient):
    """OpenAI API client with GPT models"""

    SUPPORTED_MODELS = ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"]

    def __init__(self, api_key: str, model: str = "gpt-4", **kwargs):
        """Initialize OpenAI client"""
        super().__init__(api_key, model, **kwargs)
        from openai import AsyncOpenAI
        self.client = AsyncOpenAI(api_key=api_key)

        # Use model-specific tokenizer for accurate counting
        try:
            self._encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            pass  # Keep default cl100k_base from base class
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def complete(self, prompt: str, max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate completion from prompt with automatic retry"""
        await self._apply_rate_limit()
        
        response = await self.client.completions.create(
            model=self.model,
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )
        
        return {
            "text": response.choices[0].text,
            "tokens_used": response.usage.total_tokens,
            "model": self.model,
            "finish_reason": response.choices[0].finish_reason
        }
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat(self, messages: List[Dict[str, str]], max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate chat completion with automatic retry"""
        import logging
        logger = logging.getLogger(__name__)
        
        await self._apply_rate_limit()
        
        try:
            # Build request kwargs, only include max_tokens/max_completion_tokens if provided
            request_kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                **kwargs
            }
            
            # For newer models (GPT-5+), use max_completion_tokens; for older models use max_tokens
            if max_tokens is not None:
                # Try max_completion_tokens for newer models, fallback to max_tokens
                if "gpt-5" in self.model or "o1" in self.model or "o3" in self.model:
                    request_kwargs["max_completion_tokens"] = max_tokens
                else:
                    request_kwargs["max_tokens"] = max_tokens
            
            logger.info(f"OpenAI chat request: model={self.model}, messages_count={len(messages)}")
            response = await self.client.chat.completions.create(**request_kwargs)
            
            logger.info(f"OpenAI chat response: tokens_used={response.usage.total_tokens}")
            return {
                "message": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens,
                "model": self.model,
                "finish_reason": response.choices[0].finish_reason
            }
        except Exception as e:
            logger.error(f"OpenAI chat error: {type(e).__name__}: {str(e)}")
            raise
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat_with_vision(
        self,
        prompt: str,
        image_base64: str,
        max_tokens: int = 4000,
        temperature: float = 0.1,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate chat completion with vision/image input.
        
        Requires a vision-capable model like gpt-4o or gpt-4-turbo.
        
        Args:
            prompt: Text prompt describing what to extract/analyze
            image_base64: Base64-encoded image (PNG/JPEG)
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature
            
        Returns:
            Dict with 'message', 'tokens_used', 'model', 'finish_reason'
        """
        await self._apply_rate_limit()
        
        messages = [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}}
            ]
        }]
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )
        
        return {
            "message": response.choices[0].message.content,
            "tokens_used": response.usage.total_tokens,
            "model": self.model,
            "finish_reason": response.choices[0].finish_reason
        }


class GroqClient(BaseLLMClient):
    """Groq API client with fast inference models"""

    SUPPORTED_MODELS = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "meta-llama/llama-guard-4-12b",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b"
    ]

    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile", **kwargs):
        """Initialize Groq client"""
        super().__init__(api_key, model, **kwargs)
        from groq import AsyncGroq
        self.client = AsyncGroq(api_key=api_key)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def complete(self, prompt: str, max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate completion (uses chat API internally)"""
        messages = [{"role": "user", "content": prompt}]
        return await self.chat(messages, max_tokens=max_tokens, temperature=temperature, **kwargs)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat(self, messages: List[Dict[str, str]], max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate chat completion with automatic retry"""
        await self._apply_rate_limit()
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )
        
        return {
            "message": response.choices[0].message.content,
            "tokens_used": response.usage.total_tokens,
            "model": self.model,
            "finish_reason": response.choices[0].finish_reason
        }


class GeminiClient(BaseLLMClient):
    """Google Gemini API client"""

    SUPPORTED_MODELS = ["gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"]

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash", **kwargs):
        """Initialize Gemini client"""
        super().__init__(api_key, model, **kwargs)
        from google import genai
        self.client = genai.Client(api_key=api_key)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def complete(self, prompt: str, max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate completion with automatic retry"""
        from google.genai import types
        await self._apply_rate_limit()

        
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=max_tokens,
                temperature=temperature
            )
        )
        
        return {
            "text": response.text,
            "tokens_used": self.count_tokens(prompt) + self.count_tokens(response.text),
            "model": self.model,
            "finish_reason": "stop"
        }
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat(self, messages: List[Dict[str, str]], max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate chat completion with automatic retry"""
        from google.genai import types
        await self._apply_rate_limit()
        
        # Convert messages to Gemini format
        history = []
        for msg in messages[:-1]:
            role = "user" if msg["role"] == "user" else "model"
            history.append({"role": role, "parts": [msg["content"]]})
        
        chat = self.client.aio.chats.create(model=self.model, history=history)
        response = await chat.send_message(
            messages[-1]["content"],
            config=types.GenerateContentConfig(
                max_output_tokens=max_tokens,
                temperature=temperature
            )
        )
        
        total_tokens = sum(self.count_tokens(m["content"]) for m in messages)
        total_tokens += self.count_tokens(response.text)
        
        return {
            "message": response.text,
            "tokens_used": total_tokens,
            "model": self.model,
            "finish_reason": "stop"
        }
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat_with_vision(
        self,
        prompt: str,
        image_base64: str,
        max_tokens: int = 4000,
        temperature: float = 0.1,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate completion with vision/image input.
        
        All Gemini models support vision capabilities.
        
        Args:
            prompt: Text prompt describing what to extract/analyze
            image_base64: Base64-encoded image (PNG/JPEG)
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature
            
        Returns:
            Dict with 'message', 'tokens_used', 'model', 'finish_reason'
        """
        import base64
        from google.genai import types
        await self._apply_rate_limit()
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(image_base64)
        
        # Create image part
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/png")
        
        # Send prompt with image
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(
                max_output_tokens=max_tokens,
                temperature=temperature
            )
        )
        
        return {
            "message": response.text,
            "tokens_used": self.count_tokens(prompt) + self.count_tokens(response.text),
            "model": self.model,
            "finish_reason": "stop"
        }


class OpenRouterClient(BaseLLMClient):
    """OpenRouter API client - access to multiple models through one API"""

    def __init__(self, api_key: str, model: str = "openai/gpt-4", **kwargs):
        """Initialize OpenRouter client"""
        super().__init__(api_key, model, **kwargs)
        from openai import AsyncOpenAI
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1"
        )
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def complete(self, prompt: str, max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate completion (uses chat API internally)"""
        messages = [{"role": "user", "content": prompt}]
        return await self.chat(messages, max_tokens=max_tokens, temperature=temperature, **kwargs)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat(self, messages: List[Dict[str, str]], max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate chat completion with automatic retry"""
        await self._apply_rate_limit()
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )
        
        return {
            "message": response.choices[0].message.content,
            "tokens_used": response.usage.total_tokens if response.usage else 0,
            "model": self.model,
            "finish_reason": response.choices[0].finish_reason
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat_with_vision(
        self, prompt: str, image_base64: str, max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs
    ) -> Dict[str, Any]:
        """
        Chat with vision-capable models via OpenRouter.
        
        Use vision models like: openai/gpt-4o, anthropic/claude-3-opus, google/gemini-pro-vision
        
        Args:
            prompt: Text prompt describing what to extract/analyze
            image_base64: Base64-encoded image (PNG/JPEG)
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature
        """
        await self._apply_rate_limit()
        
        messages = [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}}
            ]
        }]
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )
        
        return {
            "message": response.choices[0].message.content,
            "tokens_used": response.usage.total_tokens if response.usage else 0,
            "model": self.model,
            "finish_reason": response.choices[0].finish_reason
        }


class OllamaClient(BaseLLMClient):
    """Ollama client for local LLM inference"""

    def __init__(
        self, api_key: Optional[str] = None, model: str = "llama2", base_url: str = "http://localhost:11434", **kwargs
    ):
        """Initialize Ollama client"""
        super().__init__(api_key, model, **kwargs)
        import httpx
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=120.0)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def complete(self, prompt: str, max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate completion with automatic retry"""
        await self._apply_rate_limit()
        
        options = {"temperature": temperature}
        if max_tokens:
            options["num_predict"] = max_tokens
        
        response = await self.client.post(
            f"{self.base_url}/api/generate",
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": options
            }
        )
        response.raise_for_status()
        data = response.json()
        
        return {
            "text": data["response"],
            "tokens_used": self.count_tokens(prompt) + self.count_tokens(data["response"]),
            "model": self.model,
            "finish_reason": "stop"
        }
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat(self, messages: List[Dict[str, str]], max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs) -> Dict[str, Any]:
        """Generate chat completion with automatic retry"""
        await self._apply_rate_limit()
        
        options = {"temperature": temperature}
        if max_tokens:
            options["num_predict"] = max_tokens
        
        response = await self.client.post(
            f"{self.base_url}/api/chat",
            json={
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": options
            }
        )
        response.raise_for_status()
        data = response.json()

        total_tokens = sum(self.count_tokens(m["content"]) for m in messages)
        total_tokens += self.count_tokens(data["message"]["content"])
        
        return {
            "message": data["message"]["content"],
            "tokens_used": total_tokens,
            "model": self.model,
            "finish_reason": "stop"
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def chat_with_vision(
        self, prompt: str, image_base64: str, max_tokens: Optional[int] = None, temperature: float = 0.7, **kwargs
    ) -> Dict[str, Any]:
        """
        Chat with vision-capable Ollama models.
        
        Use vision models like: llava, bakllava, llava-llama3
        
        Args:
            prompt: Text prompt describing what to extract/analyze
            image_base64: Base64-encoded image (PNG/JPEG)
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature
        """
        await self._apply_rate_limit()
        
        options = {"temperature": temperature}
        if max_tokens:
            options["num_predict"] = max_tokens
        
        # Ollama expects images as base64 in the message
        response = await self.client.post(
            f"{self.base_url}/api/chat",
            json={
                "model": self.model,
                "messages": [{
                    "role": "user",
                    "content": prompt,
                    "images": [image_base64]
                }],
                "stream": False,
                "options": options
            }
        )
        response.raise_for_status()
        data = response.json()
        
        return {
            "message": data["message"]["content"],
            "tokens_used": self.count_tokens(prompt) + self.count_tokens(data["message"]["content"]),
            "model": self.model,
            "finish_reason": "stop"
        }


def create_llm_client(provider: LLMProvider, api_key: Optional[str], model: str, **kwargs) -> BaseLLMClient:
    """
    Factory function to create appropriate LLM client
    
    Args:
        provider: LLM provider to use
        api_key: API key for the provider (optional for Ollama)
        model: Model name to use
        **kwargs: Additional arguments passed to the client
    
    Returns:
        Configured LLM client instance
    """
    clients = {
        LLMProvider.OPENAI: OpenAIClient,
        LLMProvider.GROQ: GroqClient,
        LLMProvider.GEMINI: GeminiClient,
        LLMProvider.OPENROUTER: OpenRouterClient,
        LLMProvider.OLLAMA: OllamaClient,
    }
    
    client_class = clients.get(provider)
    if not client_class:
        raise ValueError(f"Provider {provider} not supported. Choose from: {list(clients.keys())}")
    
    return client_class(api_key=api_key, model=model, **kwargs)


# Default LLMClient for backward compatibility
class LLMClient(OpenAIClient):
    """Default LLM client (OpenAI) for backward compatibility"""
    pass


# Provider-specific default models
PROVIDER_DEFAULTS = {
    "openai": {"vision": "gpt-4o", "chat": "gpt-4o-mini"},
    "groq": {"vision": "llama-3.2-90b-vision-preview", "chat": "meta-llama/llama-4-scout-17b-16e-instruct"},
    "openrouter": {"vision": "openai/gpt-4o", "chat": "meta-llama/llama-4-scout-17b-16e-instruct"},
    "ollama": {"vision": "llava", "chat": "llama3"},
    "gemini": {"vision": "gemini-2.0-flash", "chat": "gemini-2.0-flash"},
}


def get_default_model(provider: str, use_case: str = "chat") -> str:
    """Get default model for a provider and use case.

    Args:
        provider: LLM provider name
        use_case: 'chat' for chatbot, 'vision' for PDF extraction

    Returns:
        Default model name for the provider
    """
    defaults = PROVIDER_DEFAULTS.get(provider.lower(), PROVIDER_DEFAULTS["openai"])
    return defaults.get(use_case, defaults["chat"])


def create_sync_streaming_client(provider: str, api_key: Optional[str], base_url: Optional[str] = None):
    """
    Create a sync client for streaming chat completions.

    Used by the chatbot for SSE streaming responses.
    Returns an OpenAI-compatible sync client.

    Args:
        provider: Provider name (groq, openai, openrouter, ollama)
        api_key: API key for the provider
        base_url: Optional base URL (required for ollama)

    Returns:
        Sync client with chat.completions.create(stream=True) support

    Raises:
        ValueError: If provider is unsupported, API key is missing, or SDK not installed
    """
    provider = provider.lower()

    if provider == "gemini":
        raise ValueError(
            "Gemini does not support OpenAI-compatible streaming. "
            "For chatbot, use: groq, openai, openrouter, or ollama"
        )

    if not api_key and provider != "ollama":
        raise ValueError(f"API key required for provider: {provider}. Set LLM_API_KEY in your .env file.")

    # Groq uses its own SDK
    if provider == "groq":
        try:
            from groq import Groq
        except ImportError:
            raise ValueError("The 'groq' package is required. Install with: pip install groq") from None
        return Groq(api_key=api_key)

    # All other providers use OpenAI-compatible client with different base URLs
    try:
        from openai import OpenAI
    except ImportError:
        raise ValueError("The 'openai' package is required. Install with: pip install openai") from None

    OPENAI_COMPATIBLE_PROVIDERS = {
        "openai": {"api_key": api_key},
        "openrouter": {"api_key": api_key, "base_url": "https://openrouter.ai/api/v1"},
        "ollama": {"api_key": "ollama", "base_url": base_url or "http://localhost:11434/v1"},
    }

    config = OPENAI_COMPATIBLE_PROVIDERS.get(provider)
    if config is None:
        raise ValueError(f"Unsupported provider: {provider}. Use: groq, openai, openrouter, ollama")

    return OpenAI(**config)
