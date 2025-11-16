export interface Comment {
  id: string;
  x: number;
  y: number;
  text: string;
  author?: string;
  timestamp: number;
  pageUrl: string;
  elementSelector?: string; // CSS selector path to the target element
  elementOffset?: { x: number; y: number }; // Offset within the element
}

export interface KommentOptions {
  /**
   * API endpoint for saving/loading comments
   * @default 'http://localhost:3001/api/comments'
   */
  apiEndpoint?: string;

  /**
   * Enable auto-initialization in non-production environments
   * @default true
   */
  autoEnable?: boolean;

  /**
   * Force enable even in production
   * @default false
   */
  forceEnable?: boolean;

  /**
   * Current user's name/identifier
   */
  author?: string;

  /**
   * Enable live updates via SSE
   * @default true
   */
  enableLiveUpdates?: boolean;

  /**
   * Position of the comment button
   * @default 'bottom-right'
   */
  buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface CommentPayload {
  x: number;
  y: number;
  text: string;
  author?: string;
  pageUrl: string;
  elementSelector?: string;
  elementOffset?: { x: number; y: number };
}

export interface ServerResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
