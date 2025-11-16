export const DIMENSIONS = {
  POPUP: { width: 400, height: 300 },
  TOOLTIP: { width: 350, height: 200 },
  LABEL: { width: 120, height: 30 },
  MARKER: { size: 32 },
} as const;

export const STORAGE_KEYS = {
  USER_NAME: "komment-user-name",
} as const;

export const CSS_CLASSES = {
  TEXTAREA: "komment-textarea",
} as const;

export const TIMEOUTS = {
  TOOLTIP_HIDE_DELAY: 200,
  DEBOUNCE_DELAY: 16, // ~60fps
} as const;

export const OFFSETS = {
  CURSOR_LABEL: 15,
} as const;
