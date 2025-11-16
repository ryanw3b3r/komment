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
export function generateElementSelector(element: Element | null): string | undefined {
  if (!element || element === document.body) return undefined;
  if (element.id) return `#${element.id}`;

  const buildPath = (el: Element): string[] => {
    const path: string[] = [];
    let current: Element | null = el;

    while (current && current !== document.body) {
      const siblings = current.parentElement ? Array.from(current.parentElement.children) : [];
      const index = siblings.indexOf(current) + 1;
      const selector = `${current.tagName.toLowerCase()}:nth-child(${index})`;

      path.unshift(selector);
      current = current.parentElement;
    }

    return path;
  };

  return buildPath(element).join(" > ");
}

/**
 * Find an element by selector, falling back to the first visible parent if element is hidden
 * Useful for comment markers that need to attach to visible elements
 * @param selector - CSS selector string
 * @returns The element or its first visible ancestor, or null if not found
 */
export function findElementOrVisibleParent(selector: string | undefined): Element | null {
  if (!selector) return null;

  const isVisible = (el: Element): boolean => {
    const { width, height } = el.getBoundingClientRect();
    const { display, visibility, opacity } = window.getComputedStyle(el);

    return width > 0 && height > 0 && display !== "none" && visibility !== "hidden" && opacity !== "0";
  };

  const findVisibleAncestor = (el: Element): Element | null => {
    let current: Element | null = el;

    while (current && current !== document.body) {
      if (isVisible(current)) return current;
      current = current.parentElement;
    }

    return el;
  };

  try {
    const element = document.querySelector(selector);
    return element ? findVisibleAncestor(element) : null;
  } catch {
    return null;
  }
}
