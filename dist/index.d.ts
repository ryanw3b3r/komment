export { createKomment, default as KommentPlugin } from './plugin';
export { default as Komment } from './components/Komment.vue';
export { default as CommentMarker } from './components/CommentMarker.vue';
export { default as CommentPopup } from './components/CommentPopup.vue';
export { useComments } from './composables/useComments';
export type { Comment, KommentOptions, CommentPayload, ServerResponse, } from './types';
