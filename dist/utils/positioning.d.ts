export interface Position {
    x: number;
    y: number;
}
export interface Dimensions {
    width: number;
    height: number;
}
export interface PositioningOptions {
    element: Dimensions;
    offset?: number;
    padding?: number;
}
export interface ViewportBounds {
    width: number;
    height: number;
}
export declare enum Placement {
    Right = "right",
    Left = "left",
    Below = "below",
    Above = "above"
}
/**
 * Viewport-aware positioning system for popups, tooltips, and labels
 * Automatically adjusts element positions to keep them within viewport bounds
 * @example
 * ```ts
 * const positioner = new ViewportPositioner();
 * const position = positioner.calculatePopupPosition(
 *   { x: 100, y: 200 },
 *   { width: 320, height: 200 }
 * );
 * ```
 */
export declare class ViewportPositioner {
    private readonly viewportBounds;
    private readonly offset;
    private readonly padding;
    /**
     * Create a new ViewportPositioner
     * @param offset - Default offset from cursor/anchor point (default: 20px)
     * @param padding - Minimum padding from viewport edges (default: 10px)
     */
    constructor(offset?: number, padding?: number);
    /**
     * Calculate optimal position for a popup element
     * Prefers placing to the right and below cursor, adjusts if doesn't fit
     * @param cursorPosition - Cursor position in page coordinates
     * @param dimensions - Popup width and height
     * @returns Optimal position in page coordinates
     */
    calculatePopupPosition(cursorPosition: Position, dimensions: Dimensions): Position;
    /**
     * Calculate tooltip offset from marker position
     * Tries placements in order: right, left, below, above
     * @param markerPosition - Marker position in page coordinates
     * @param dimensions - Tooltip width and height
     * @returns CSS offset values (left, top) relative to marker
     */
    calculateTooltipOffset(markerPosition: Position, dimensions: Dimensions): {
        left: string;
        top: string;
    };
    /**
     * Calculate position for cursor label
     * Similar to popup but with smaller default offset
     * @param cursorPosition - Cursor position in viewport coordinates
     * @param dimensions - Label width and height
     * @param offset - Distance from cursor (default: 15px)
     * @returns Optimal position in viewport coordinates
     */
    calculateLabelPosition(cursorPosition: Position, dimensions: Dimensions, offset?: number): Position;
    private tryRight;
    private tryLeft;
    private tryBelow;
    private tryAbove;
    private fitsInViewport;
    private fitsRight;
    private fitsBottom;
    private fitsWithinHorizontalBounds;
    private fitsWithinVerticalBounds;
    private offsetPosition;
    private toViewportCoords;
    private toPageCoords;
    private formatOffset;
}
