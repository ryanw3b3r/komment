import { ViewportPositioner } from "../utils/positioning";

/**
 * Singleton ViewportPositioner instance
 * Shared across all components to avoid creating multiple instances
 */
let positionerInstance: ViewportPositioner | null = null;

/**
 * Get or create the shared ViewportPositioner instance
 * @returns Shared ViewportPositioner instance
 */
export function usePositioner(): ViewportPositioner {
  if (!positionerInstance) {
    positionerInstance = new ViewportPositioner();
  }
  return positionerInstance;
}
