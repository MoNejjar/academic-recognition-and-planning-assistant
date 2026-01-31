/**
 * Utility functions shared across staff pages
 */

/**
 * Get the API URL from environment or use default
 */
export const getApiUrl = (): string => {
    return (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

/**
 * Format a date string with time
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get color based on task age
 */
export const getTaskAgeColor = (createdAt: string | undefined): string => {
    if (!createdAt) return '#6B7280';
    
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffDays <= 7) return '#22c55e'; // Green - up to 1 week
    if (diffDays <= 30) return '#f59e0b'; // Orange - up to 1 month
    return '#ef4444'; // Red - over 1 month
};
