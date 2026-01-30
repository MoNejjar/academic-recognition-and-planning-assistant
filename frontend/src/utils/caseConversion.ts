/**
 * Case Conversion Utilities
 * 
 * Utilities for converting between camelCase and snake_case
 * Used for frontend-backend data transformation
 */

/**
 * Convert camelCase keys to snake_case recursively
 */
export function camelToSnake(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(camelToSnake);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            acc[snakeKey] = camelToSnake(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
}

/**
 * Convert snake_case keys to camelCase recursively
 */
export function snakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(snakeToCamel);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[camelKey] = snakeToCamel(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
}
