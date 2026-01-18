/*
 * Chatbot Service
 *
 * API calls for chatbot interactions.
 * Note: Chat streaming is handled directly in useChat hook for better state management.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Get the full URL for a document path returned by the API.
 */
export function getDocumentUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/**
 * Check chatbot health including RAG status.
 */
export async function getChatbotHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  rag_initialized: boolean;
  document_count: number;
  error?: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/health`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
