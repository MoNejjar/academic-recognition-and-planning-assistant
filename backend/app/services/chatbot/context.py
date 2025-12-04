"""
Context Manager

Manages context documents for chatbot
"""

# TODO: Implement context loading from PDFs
# TODO: Implement context chunking
# TODO: Implement context retrieval (RAG if needed)


class ContextManager:
    """Manages context for chatbot responses"""
    
    def load_context(self, document_ids: list):
        """Load context from documents"""
        # TODO: Implement
        raise NotImplementedError
    
    def search_context(self, query: str):
        """Search for relevant context"""
        # TODO: Implement
        raise NotImplementedError
