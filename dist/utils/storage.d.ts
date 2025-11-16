/**
 * Safe localStorage wrapper with error handling
 * Handles cases where localStorage is disabled, full, or throws errors
 */
/**
 * Safely get an item from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if retrieval fails
 * @returns Stored value or default value
 */
export declare function getStorageItem(key: string, defaultValue?: string): string;
/**
 * Safely set an item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if successful, false otherwise
 */
export declare function setStorageItem(key: string, value: string): boolean;
/**
 * Safely remove an item from localStorage
 * @param key - Storage key
 * @returns True if successful, false otherwise
 */
export declare function removeStorageItem(key: string): boolean;
/**
 * Check if localStorage is available
 * @returns True if localStorage is available and working
 */
export declare function isStorageAvailable(): boolean;
