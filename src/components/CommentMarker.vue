<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { Comment } from "../types";
import type { Position } from "../utils/positioning";
import { findElementOrVisibleParent } from "../utils/elementSelector";
import { ViewportPositioner } from "../utils/positioning";
import { DIMENSIONS } from "../constants";

const props = defineProps<{
  comment: Comment;
}>();

const emit = defineEmits<{
  delete: [id: string];
  edit: [comment: Comment];
  hover: [];
  unhover: [];
}>();

const positioner = new ViewportPositioner();
const showTooltip = ref(false);
const hideTimeout = ref<number | null>(null);
const resizeTrigger = ref(0);

const markerPosition = computed<Position>(() => {
  resizeTrigger.value;

  const calculateFromElement = (): Position | null => {
    if (!props.comment.elementSelector) return null;

    const element = findElementOrVisibleParent(props.comment.elementSelector);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const offset = props.comment.elementOffset || { x: 0, y: 0 };

    return {
      x: rect.left + offset.x + window.scrollX,
      y: rect.top + offset.y + window.scrollY,
    };
  };

  return calculateFromElement() || { x: props.comment.x, y: props.comment.y };
});

const tooltipOffset = computed(() =>
  positioner.calculateTooltipOffset(markerPosition.value, DIMENSIONS.TOOLTIP)
);

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function handleEdit() {
  emit("edit", props.comment);
  showTooltip.value = false;
}

function handleDelete() {
  if (confirm("Are you sure you want to delete this comment?")) {
    emit("delete", props.comment.id);
  }
}

const clearHideTimeout = () => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
    hideTimeout.value = null;
  }
};

function handleMarkerEnter() {
  clearHideTimeout();
  showTooltip.value = true;
  emit("hover");
}

function handleMarkerLeave() {
  hideTimeout.value = window.setTimeout(() => {
    showTooltip.value = false;
    emit("unhover");
    hideTimeout.value = null;
  }, 200);
}

function handleTooltipEnter() {
  clearHideTimeout();
}

function handleTooltipLeave() {
  showTooltip.value = false;
  emit("unhover");
}

const handleResize = () => resizeTrigger.value++;

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize();
});

onUnmounted(() => {
  clearHideTimeout();
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div
    class="km:absolute km:z-[9997]"
    :style="{
      left: `${markerPosition.x}px`,
      top: `${markerPosition.y}px`,
      transform: 'translate(-50%, -50%)',
    }"
    @mouseenter="handleMarkerEnter"
    @mouseleave="handleMarkerLeave"
  >
    <!-- Marker Pin -->
    <div
      class="km:w-8 km:h-8 km:bg-blue-500 km:rounded-full km:shadow-lg km:cursor-pointer km:flex km:items-center km:justify-center km:text-white km:font-bold km:text-sm km:hover:scale-110 km:transition-transform"
      @click="handleEdit"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="km:w-5 km:h-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 10c0 3.866-3.582 8-8 8s-8-4.134-8-8 3.582-8 8-8 8 4.134 8 8zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- Tooltip with Comment -->
    <Transition
      enter-active-class="km:transition km:duration-200 km:ease-out"
      enter-from-class="km:opacity-0 km:scale-95"
      enter-to-class="km:opacity-100 km:scale-100"
      leave-active-class="km:transition km:duration-100 km:ease-in"
      leave-from-class="km:opacity-100 km:scale-100"
      leave-to-class="km:opacity-0 km:scale-95"
    >
      <div
        v-if="showTooltip"
        class="km:absolute km:z-[9998] km:min-w-[250px] km:max-w-[350px] km:bg-white km:rounded-lg km:shadow-xl km:p-4 km:border km:border-gray-200 km:cursor-pointer"
        :style="{
          left: tooltipOffset.left,
          top: tooltipOffset.top,
        }"
        @click.stop="handleEdit"
        @mouseenter="handleTooltipEnter"
        @mouseleave="handleTooltipLeave"
      >
        <!-- Header -->
        <div class="km:flex km:justify-between km:items-start km:mb-2">
          <div class="km:flex-1">
            <div
              v-if="comment.author"
              class="km:text-sm km:font-semibold km:text-gray-900"
            >
              {{ comment.author }}
            </div>
            <div class="km:text-xs km:text-gray-500">
              {{ formatDate(comment.timestamp) }}
            </div>
          </div>
          <button
            @click.stop="handleDelete"
            class="km:text-gray-400 km:cursor-pointer km:hover:text-red-500 km:transition-colors km:p-1"
            title="Delete comment"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="km:h-5 km:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Comment Text -->
        <div
          class="km:text-sm km:text-gray-700 km:whitespace-pre-wrap km:break-words km:mb-2"
        >
          {{ comment.text }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
