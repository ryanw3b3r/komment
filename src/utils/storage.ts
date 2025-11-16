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
export function getStorageItem(key: string, defaultValue: string = ''): string {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.warn(`Failed to read from localStorage (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if successful, false otherwise
 */
export function setStorageItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to write to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * @param key - Storage key
 * @returns True if successful, false otherwise
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Check if localStorage is available
 * @returns True if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
