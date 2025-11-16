/**
 * Generate a unique CSS selector for an element
 * Uses ID if available, otherwise builds a path using nth-child selectors
 * @param element - The DOM element to generate a selector for
 * @returns CSS selector string, or undefined if element is null/body
 * @example
 * ```ts
 * const selector = generateElementSelector(document.querySelector('.my-element'));
 * // Returns something like: "div:nth-child(1) > section:nth-child(2) > p:nth-child(3)"
 * ```
 */
export declare function generateElementSelector(element: Element | null): string | undefined;
/**
 * Find an element by selector, falling back to the first visible parent if element is hidden
 * Useful for comment markers that need to attach to visible elements
 * @param selector - CSS selector string
 * @returns The element or its first visible ancestor, or null if not found
 */
export declare function findElementOrVisibleParent(selector: string | undefined): Element | null;
