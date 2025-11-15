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
export declare class ViewportPositioner {
    private readonly viewportBounds;
    private readonly offset;
    private readonly padding;
    constructor(offset?: number, padding?: number);
    calculatePopupPosition(cursorPosition: Position, dimensions: Dimensions): Position;
    calculateTooltipOffset(markerPosition: Position, dimensions: Dimensions): {
        left: string;
        top: string;
    };
    calculateLabelPosition(cursorPosition: Position, dimensions: Dimensions): Position;
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
