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

export enum Placement {
  Right = "right",
  Left = "left",
  Below = "below",
  Above = "above",
}

interface PlacementResult {
  fits: boolean;
  offset: Position;
}

const DEFAULT_OFFSET = 20;
const DEFAULT_PADDING = 10;

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
export class ViewportPositioner {
  private readonly viewportBounds: ViewportBounds;
  private readonly offset: number;
  private readonly padding: number;

  /**
   * Create a new ViewportPositioner
   * @param offset - Default offset from cursor/anchor point (default: 20px)
   * @param padding - Minimum padding from viewport edges (default: 10px)
   */
  constructor(offset = DEFAULT_OFFSET, padding = DEFAULT_PADDING) {
    this.viewportBounds = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.offset = offset;
    this.padding = padding;
  }

  /**
   * Calculate optimal position for a popup element
   * Prefers placing to the right and below cursor, adjusts if doesn't fit
   * @param cursorPosition - Cursor position in page coordinates
   * @param dimensions - Popup width and height
   * @returns Optimal position in page coordinates
   */
  calculatePopupPosition(
    cursorPosition: Position,
    dimensions: Dimensions
  ): Position {
    const viewport = this.toViewportCoords(cursorPosition);
    let position = this.offsetPosition(viewport, this.offset, this.offset);

    if (!this.fitsRight(position, dimensions)) {
      position.x = viewport.x - dimensions.width - this.offset;
    }

    if (!this.fitsWithinHorizontalBounds(position.x, dimensions.width)) {
      position.x = Math.max(this.padding, Math.min(
        position.x,
        this.viewportBounds.width - dimensions.width - this.padding
      ));
    }

    if (!this.fitsBottom(position, dimensions)) {
      position.y = viewport.y - dimensions.height - this.offset;
    }

    if (!this.fitsWithinVerticalBounds(position.y, dimensions.height)) {
      position.y = Math.max(this.padding, Math.min(
        position.y,
        this.viewportBounds.height - dimensions.height - this.padding
      ));
    }

    return this.toPageCoords(position);
  }

  /**
   * Calculate tooltip offset from marker position
   * Tries placements in order: right, left, below, above
   * @param markerPosition - Marker position in page coordinates
   * @param dimensions - Tooltip width and height
   * @returns CSS offset values (left, top) relative to marker
   */
  calculateTooltipOffset(
    markerPosition: Position,
    dimensions: Dimensions
  ): { left: string; top: string } {
    const viewport = this.toViewportCoords(markerPosition);

    const placements: Array<() => PlacementResult> = [
      () => this.tryRight(viewport, dimensions),
      () => this.tryLeft(viewport, dimensions),
      () => this.tryBelow(viewport, dimensions),
      () => this.tryAbove(viewport, dimensions),
    ];

    for (const placement of placements) {
      const result = placement();
      if (result.fits) {
        return this.formatOffset(result.offset);
      }
    }

    return this.formatOffset({ x: this.offset, y: 0 });
  }

  /**
   * Calculate position for cursor label
   * Similar to popup but with smaller default offset
   * @param cursorPosition - Cursor position in viewport coordinates
   * @param dimensions - Label width and height
   * @param offset - Distance from cursor (default: 15px)
   * @returns Optimal position in viewport coordinates
   */
  calculateLabelPosition(
    cursorPosition: Position,
    dimensions: Dimensions,
    offset = 15
  ): Position {
    const viewport = cursorPosition;
    let position = this.offsetPosition(viewport, offset, offset);

    if (!this.fitsRight(position, dimensions)) {
      position.x = viewport.x - dimensions.width - offset;
    }

    position.x = Math.max(this.padding, Math.min(
      position.x,
      this.viewportBounds.width - dimensions.width - this.padding
    ));

    if (!this.fitsBottom(position, dimensions)) {
      position.y = viewport.y - dimensions.height - offset;
    }

    position.y = Math.max(this.padding, Math.min(
      position.y,
      this.viewportBounds.height - dimensions.height - this.padding
    ));

    return position;
  }

  private tryRight(viewport: Position, dimensions: Dimensions): PlacementResult {
    const x = viewport.x + this.offset;
    const y = viewport.y;

    return {
      fits: this.fitsInViewport({ x, y }, dimensions),
      offset: { x: this.offset, y: 0 },
    };
  }

  private tryLeft(viewport: Position, dimensions: Dimensions): PlacementResult {
    const x = viewport.x - dimensions.width - this.offset;
    const y = viewport.y;

    return {
      fits: this.fitsInViewport({ x, y }, dimensions),
      offset: { x: -(dimensions.width + this.offset), y: 0 },
    };
  }

  private tryBelow(viewport: Position, dimensions: Dimensions): PlacementResult {
    const x = viewport.x - dimensions.width / 2;
    const y = viewport.y + this.offset;

    return {
      fits: this.fitsInViewport({ x, y }, dimensions),
      offset: { x: -(dimensions.width / 2), y: this.offset },
    };
  }

  private tryAbove(viewport: Position, dimensions: Dimensions): PlacementResult {
    const x = viewport.x - dimensions.width / 2;
    const y = viewport.y - dimensions.height - this.offset;

    return {
      fits: this.fitsInViewport({ x, y }, dimensions),
      offset: { x: -(dimensions.width / 2), y: -(dimensions.height + this.offset) },
    };
  }

  private fitsInViewport(position: Position, dimensions: Dimensions): boolean {
    return (
      this.fitsWithinHorizontalBounds(position.x, dimensions.width) &&
      this.fitsWithinVerticalBounds(position.y, dimensions.height)
    );
  }

  private fitsRight(position: Position, dimensions: Dimensions): boolean {
    return position.x + dimensions.width <= this.viewportBounds.width - this.padding;
  }

  private fitsBottom(position: Position, dimensions: Dimensions): boolean {
    return position.y + dimensions.height <= this.viewportBounds.height - this.padding;
  }

  private fitsWithinHorizontalBounds(x: number, width: number): boolean {
    return x >= this.padding && x + width <= this.viewportBounds.width - this.padding;
  }

  private fitsWithinVerticalBounds(y: number, height: number): boolean {
    return y >= this.padding && y + height <= this.viewportBounds.height - this.padding;
  }

  private offsetPosition(position: Position, offsetX: number, offsetY: number): Position {
    return { x: position.x + offsetX, y: position.y + offsetY };
  }

  private toViewportCoords(pagePosition: Position): Position {
    return {
      x: pagePosition.x - window.scrollX,
      y: pagePosition.y - window.scrollY,
    };
  }

  private toPageCoords(viewportPosition: Position): Position {
    return {
      x: viewportPosition.x + window.scrollX,
      y: viewportPosition.y + window.scrollY,
    };
  }

  private formatOffset(offset: Position): { left: string; top: string } {
    return {
      left: `${offset.x}px`,
      top: `${offset.y}px`,
    };
  }
}
