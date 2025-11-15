export const DIMENSIONS = {
  POPUP: { width: 400, height: 300 },
  TOOLTIP: { width: 350, height: 200 },
  LABEL: { width: 120, height: 30 },
  MARKER: { size: 32 },
} as const;

export const STORAGE_KEYS = {
  USER_NAME: "komment-user-name",
} as const;

export const Z_INDEX = {
  OVERLAY: 9995,
  MARKER: 9997,
  TOOLTIP: 9998,
  BUTTON: 9999,
  LABEL: 9999,
  POPUP: 10000,
  MODAL: 10002,
} as const;

export const CSS_CLASSES = {
  TEXTAREA: "komment-textarea",
} as const;
