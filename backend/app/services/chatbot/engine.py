"""
Chatbot Engine

Core chatbot logic and response generation
"""

# TODO: Implement context-based chat
# TODO: Implement guardrails (stop chatbot from helping match courses)
# TODO: Implement chat history management


class ChatbotEngine:
    """Handles chatbot interactions"""
    
    def __init__(self, llm_client):
        self.llm_client = llm_client
    
    async def process_message(self, message: str, context: list = None):
        """Process user message and generate response"""
        # TODO: Implement
        raise NotImplementedError
    
    def _apply_guardrails(self, message: str) -> bool:
        """Check if message is within allowed scope"""
        # TODO: Implement - prevent chatbot from helping with course matching
        raise NotImplementedError
