"""
LLM Client

Base LLM API client for making calls to language models
"""

# TODO: Implement LLM client (OpenAI, Azure, TUM-hosted models)
# TODO: Implement model selection
# TODO: Implement retry logic
# TODO: Implement token counting
# TODO: Implement rate limiting


class LLMClient:
    """Base LLM client"""
    
    def __init__(self, api_key: str, model: str = "gpt-4"):
        self.api_key = api_key
        self.model = model
    
    async def complete(self, prompt: str, **kwargs):
        """Generate completion from prompt"""
        # TODO: Implement
        raise NotImplementedError
    
    async def chat(self, messages: list, **kwargs):
        """Generate chat completion"""
        # TODO: Implement
        raise NotImplementedError
