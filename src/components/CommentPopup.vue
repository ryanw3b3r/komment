<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  modelValue: string;
  position: { x: number; y: number };
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  save: [];
  cancel: [];
  hover: [];
  unhover: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const popupRef = ref<HTMLDivElement | null>(null);

const localValue = ref(props.modelValue);

// Sync with v-model
watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = newVal;
  }
);

watch(localValue, (newVal) => {
  emit("update:modelValue", newVal);
  adjustTextareaHeight();
});

function adjustTextareaHeight() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
    }
  });
}

function handleClickOutside(event: MouseEvent) {
  if (popupRef.value && !popupRef.value.contains(event.target as Node)) {
    emit("cancel");
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("cancel");
  } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    emit("save");
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
  nextTick(() => {
    textareaRef.value?.focus();
  });
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div
    ref="popupRef"
    class="km:fixed km:z-[10000] km:bg-white km:rounded-lg km:shadow-2xl km:p-4 km:border km:border-gray-200 km:min-w-[320px] km:max-w-[400px]"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
    }"
    @mouseenter="emit('hover')"
    @mouseleave="emit('unhover')"
  >
    <!-- Header -->
    <div class="km:mb-3">
      <h3 class="km:text-sm km:font-semibold km:text-gray-900">Add Comment</h3>
      <p class="km:text-xs km:text-gray-500 km:mt-1">
        Enter your feedback or comment below
      </p>
    </div>

    <!-- Textarea -->
    <textarea
      ref="textareaRef"
      v-model="localValue"
      class="komment-textarea km:w-full km:px-3 km:py-2 km:border km:border-gray-300 km:rounded-md km:text-sm km:text-gray-900 km:resize-none focus:km:outline-none focus:km:ring-2 focus:km:ring-blue-500 focus:km:border-transparent km:min-h-[80px] km:max-h-[300px]"
      placeholder="Type your comment here..."
      :disabled="isLoading"
    ></textarea>

    <!-- Keyboard shortcut hint -->
    <div class="km:text-xs km:text-gray-400 km:mt-2">
      <kbd
        class="km:px-1 km:py-0.5 km:bg-gray-100 km:rounded km:border km:border-gray-300"
        >Esc</kbd
      >
      to cancel,
      <kbd
        class="km:px-1 km:py-0.5 km:bg-gray-100 km:rounded km:border km:border-gray-300"
        >Cmd/Ctrl+Enter</kbd
      >
      to save
    </div>

    <!-- Actions -->
    <div class="km:flex km:justify-end km:gap-2 km:mt-4">
      <button
        @click="emit('cancel')"
        :disabled="isLoading"
        class="km:px-4 km:py-2 km:text-sm km:font-medium km:text-gray-700 km:bg-white km:border km:border-gray-300 km:rounded-md km:cursor-pointer km:hover:bg-gray-50 focus:km:outline-none focus:km:ring-2 focus:km:ring-offset-2 focus:km:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
      >
        Cancel
      </button>
      <button
        @click="emit('save')"
        :disabled="isLoading || !localValue.trim()"
        class="km:px-4 km:py-2 km:text-sm km:font-medium km:text-white km:bg-blue-500 km:border km:border-transparent km:rounded-md km:cursor-pointer km:hover:bg-blue-600 focus:km:outline-none focus:km:ring-2 focus:km:ring-offset-2 focus:km:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
      >
        {{ isLoading ? "Saving..." : "Save" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
