<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import type { KommentOptions, CommentPayload, Comment } from "../types";
import type { Position } from "../utils/positioning";
import { useComments } from "../composables/useComments";
import CommentMarker from "./CommentMarker.vue";
import CommentPopup from "./CommentPopup.vue";
import { generateElementSelector } from "../utils/elementSelector";
import { DIMENSIONS, STORAGE_KEYS, CSS_CLASSES, OFFSETS } from "../constants";
import { getStorageItem, setStorageItem } from "../utils/storage";
import { usePositioner } from "../composables/usePositioner";

const props = withDefaults(defineProps<KommentOptions>(), {
  apiEndpoint: "http://localhost:3001/api/comments",
  autoEnable: true,
  forceEnable: false,
  enableLiveUpdates: true,
  buttonPosition: "bottom-right",
});

const positioner = usePositioner();

const isActive = ref(false);
const isCommentMode = ref(false);
const showPopup = ref(false);
const showNamePrompt = ref(false);
const popupPosition = ref<Position>({ x: 0, y: 0 });
const cursorPosition = ref<Position>({ x: 0, y: 0 });
const cursorLabelPosition = ref<Position>({ x: 0, y: 0 });
const newCommentText = ref("");
const userName = ref("");
const editingCommentId = ref<string | null>(null);
const isHoveringMarkerOrPopup = ref(false);
const currentElementInfo = ref<{ selector?: string; offset?: Position }>({});

// Composables
const {
  comments,
  isLoading,
  error,
  fetchComments,
  saveComment,
  updateComment,
  deleteComment,
  setupLiveUpdates,
  cleanup,
} = useComments(props);

// Computed
const shouldEnable = computed(() => {
  if (props.forceEnable) return true;
  if (!props.autoEnable) return false;
  return process.env.NODE_ENV !== "production";
});

const buttonText = computed(() => {
  return isCommentMode.value ? "Finish" : "Comment";
});

const buttonPositionClasses = computed(() => {
  const positions = {
    "top-left": "km:fixed km:top-4 km:left-4",
    "top-right": "km:fixed km:top-4 km:right-4",
    "bottom-left": "km:fixed km:bottom-4 km:left-4",
    "bottom-right": "km:fixed km:bottom-4 km:right-4",
  };
  return positions[props.buttonPosition];
});

const currentAuthor = computed(() => {
  return userName.value || props.author || "Anonymous";
});

// Methods
function toggleCommentMode(): void {
  isCommentMode.value = !isCommentMode.value;

  if (isCommentMode.value) {
    const saved = getStorageItem(STORAGE_KEYS.USER_NAME);
    if (!saved && !userName.value) {
      showNamePrompt.value = true;
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("mousemove", handleMouseMove);
  } else {
    // Exiting comment mode
    document.body.style.overflow = "";
    document.removeEventListener("mousemove", handleMouseMove);
    showPopup.value = false;
    newCommentText.value = "";
  }
}

function handleMouseMove(event: MouseEvent): void {
  cursorPosition.value = { x: event.clientX, y: event.clientY };
  cursorLabelPosition.value = positioner.calculateLabelPosition(
    cursorPosition.value,
    DIMENSIONS.LABEL,
    OFFSETS.CURSOR_LABEL
  );
}

function handleOverlayClick(event: MouseEvent): void {
  if (!isCommentMode.value) return;

  const captureElementInfo = () => {
    // Temporarily hide the overlay to detect the element underneath
    const overlay = event.target as HTMLElement;
    const originalPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = 'none';

    // Get the actual element underneath the overlay
    const targetElement = document.elementFromPoint(
      event.clientX,
      event.clientY
    );

    // Restore overlay
    overlay.style.pointerEvents = originalPointerEvents;

    // Filter out Komment's own elements
    const isKommentElement = (el: Element | null): boolean => {
      if (!el) return false;
      return el.closest('#komment-root') !== null ||
             el.id === 'komment-root';
    };

    if (isKommentElement(targetElement)) {
      return { selector: undefined, offset: undefined };
    }

    const elementSelector = generateElementSelector(targetElement);

    if (!targetElement) return { selector: elementSelector };

    const rect = targetElement.getBoundingClientRect();
    return {
      selector: elementSelector,
      offset: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    };
  };

  currentElementInfo.value = captureElementInfo();
  popupPosition.value = positioner.calculatePopupPosition(
    { x: event.clientX, y: event.clientY },
    DIMENSIONS.POPUP
  );
  showPopup.value = true;

  focusCommentTextarea();
}

async function handleSaveComment(): Promise<void> {
  if (!newCommentText.value.trim()) return;

  if (editingCommentId.value) {
    // Update existing comment
    const updated = await updateComment(
      editingCommentId.value,
      newCommentText.value.trim()
    );

    if (updated) {
      resetCommentPopup();
    }
  } else {
    // Create new comment
    const payload: CommentPayload = {
      x: popupPosition.value.x,
      y: popupPosition.value.y,
      text: newCommentText.value.trim(),
      author: currentAuthor.value,
      pageUrl: window.location.pathname,
      elementSelector: currentElementInfo.value.selector,
      elementOffset: currentElementInfo.value.offset,
    };

    const savedComment = await saveComment(payload);

    if (savedComment) {
      resetCommentPopup();
      currentElementInfo.value = {}; // Clear element info
    }
  }
}

function loadUserName(): void {
  const saved = getStorageItem(STORAGE_KEYS.USER_NAME);
  if (saved) {
    userName.value = saved;
    return;
  }

  showNamePrompt.value = true;
}

function saveUserName(name: string): void {
  userName.value = name;
  setStorageItem(STORAGE_KEYS.USER_NAME, name);
  showNamePrompt.value = false;
}

function changeUserName(): void {
  showNamePrompt.value = true;
}

function focusCommentTextarea(): void {
  nextTick(() => {
    document
      .querySelector<HTMLTextAreaElement>(`.${CSS_CLASSES.TEXTAREA}`)
      ?.focus();
  });
}

function resetCommentPopup(): void {
  showPopup.value = false;
  newCommentText.value = "";
  editingCommentId.value = null;
}

function handleCancelComment(): void {
  resetCommentPopup();
}

function handleEditComment(comment: Comment): void {
  popupPosition.value = positioner.calculatePopupPosition(
    { x: comment.x, y: comment.y },
    DIMENSIONS.POPUP
  );
  newCommentText.value = comment.text;
  editingCommentId.value = comment.id;
  showPopup.value = true;

  focusCommentTextarea();
}

function handleDeleteComment(id: string): void {
  deleteComment(id);
}

// Lifecycle
onMounted(async () => {
  if (shouldEnable.value) {
    isActive.value = true;
    loadUserName();
    await fetchComments();
    setupLiveUpdates();
  }
});

onUnmounted(() => {
  cleanup();
  document.removeEventListener("mousemove", handleMouseMove);
  document.body.style.overflow = "";
});
</script>

<template>
  <div v-if="isActive" class="komment-container">
    <!-- Comment Button -->
    <button
      @click="toggleCommentMode"
      @mouseenter="isHoveringMarkerOrPopup = true"
      @mouseleave="isHoveringMarkerOrPopup = false"
      :class="[
        'km:z-[9999] km:px-6 km:py-3 km:rounded-full km:shadow-lg km:cursor-pointer',
        'km:font-semibold km:text-white km:transition-all km:duration-200',
        'km:hover:scale-105 km:focus:outline-none km:focus:ring-2 km:focus:ring-offset-2',
        isCommentMode
          ? 'km:bg-red-500 km:hover:bg-red-600 km:focus:ring-red-500'
          : 'km:bg-blue-500 km:hover:bg-blue-600 km:focus:ring-blue-500',
        buttonPositionClasses,
      ]"
    >
      {{ buttonText }}
    </button>

    <!-- Overlay (shown when in comment mode or when viewing comments) -->
    <div
      v-if="isCommentMode"
      @click="handleOverlayClick"
      :class="[
        'km:fixed km:inset-0 km:z-[9995] km:bg-white/30',
        'km:cursor-crosshair km:**:cursor-crosshair',
      ]"
    >
      <!-- Cursor Label (hidden when popup is open or hovering over markers/popup) -->
      <div
        v-if="!showPopup && !isHoveringMarkerOrPopup"
        class="km:fixed km:pointer-events-none km:z-[9999] km:px-3 km:py-1 km:bg-gray-900 km:text-white km:text-sm km:rounded km:shadow-lg"
        :style="{
          left: `${cursorLabelPosition.x}px`,
          top: `${cursorLabelPosition.y}px`,
        }"
      >
        add comment
      </div>
    </div>

    <!-- Comment Markers (visible only in comment mode) -->
    <template v-if="isCommentMode">
      <CommentMarker
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        @delete="handleDeleteComment"
        @edit="handleEditComment"
        @hover="isHoveringMarkerOrPopup = true"
        @unhover="isHoveringMarkerOrPopup = false"
      />
    </template>

    <!-- Comment Popup -->
    <CommentPopup
      v-if="showPopup"
      v-model="newCommentText"
      :position="popupPosition"
      :is-loading="isLoading"
      @save="handleSaveComment"
      @cancel="handleCancelComment"
      @hover="isHoveringMarkerOrPopup = true"
      @unhover="isHoveringMarkerOrPopup = false"
    />

    <!-- Error Toast -->
    <div
      v-if="error"
      class="km:fixed km:bottom-20 km:right-4 km:z-[10001] km:px-4 km:py-3 km:bg-red-500 km:text-white km:rounded km:shadow-lg"
    >
      {{ error }}
    </div>

    <!-- Name Prompt Modal -->
    <div
      v-if="showNamePrompt"
      class="km:fixed km:inset-0 km:z-[10002] km:flex km:items-center km:justify-center km:bg-black/50"
    >
      <div
        class="km:bg-white km:rounded-lg km:shadow-2xl km:p-6 km:max-w-md km:w-full km:mx-4"
      >
        <h2 class="km:text-xl km:font-bold km:text-gray-900 km:mb-2">
          Welcome to Komment!
        </h2>
        <p class="km:text-sm km:text-gray-600 km:mb-4">
          Please enter your name to start commenting:
        </p>
        <input
          ref="nameInput"
          v-model="userName"
          type="text"
          placeholder="Your name..."
          class="km:w-full km:px-3 km:py-2 km:border km:border-gray-300 km:rounded-md km:text-sm km:focus:outline-none km:focus:ring-2 km:focus:ring-blue-500 km:mb-4"
          @keyup.enter="userName.trim() && saveUserName(userName.trim())"
        />
        <div class="km:flex km:justify-end km:gap-2">
          <button
            @click="saveUserName(userName.trim() || 'Anonymous')"
            :disabled="!userName.trim()"
            class="km:px-4 km:py-2 km:text-sm km:font-medium km:text-white km:bg-blue-500 km:border km:border-transparent km:rounded-md km:cursor-pointer km:hover:bg-blue-600 km:focus:outline-none km:focus:ring-2 km:focus:ring-offset-2 km:focus:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
          >
            Start Commenting
          </button>
        </div>
      </div>
    </div>

    <!-- User Info / Change Name Button -->
    <div
      v-if="!isCommentMode"
      class="km:fixed km:bottom-4 km:left-4 km:z-[9999] km:bg-white km:rounded-lg km:shadow-md km:px-3 km:py-2 km:flex km:items-center km:gap-2"
    >
      <span class="km:text-sm km:text-gray-700">{{ currentAuthor }}</span>
      <button
        @click="changeUserName"
        class="km:text-xs km:text-blue-500 km:cursor-pointer km:hover:text-blue-700 km:underline"
        title="Change name"
      >
        change
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
</style>
