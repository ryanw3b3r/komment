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
