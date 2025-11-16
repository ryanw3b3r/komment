// Main entry point for the Komment package
import "./style.css";

// Export the plugin
export { createKomment, default as KommentPlugin } from "./plugin";

// Export components (for advanced usage)
export { default as Komment } from "./components/Komment.vue";
export { default as CommentMarker } from "./components/CommentMarker.vue";
export { default as CommentPopup } from "./components/CommentPopup.vue";

// Export composables
export { useComments } from "./composables/useComments";

// Export types
export type {
  Comment,
  KommentOptions,
  CommentPayload,
  ServerResponse,
} from "./types";
