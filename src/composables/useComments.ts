import { ref, computed } from "vue";
import type {
  Comment,
  CommentPayload,
  ServerResponse,
  KommentOptions,
} from "../types";

/**
 * Composable for managing comments with API integration and real-time updates
 * @param options - Configuration options for the comment system
 * @returns Object containing comment state, CRUD operations, and lifecycle methods
 * @example
 * ```ts
 * const {
 *   comments,
 *   isLoading,
 *   fetchComments,
 *   saveComment
 * } = useComments({ apiEndpoint: 'http://localhost:3001/api/comments' });
 * ```
 */
export function useComments(options: KommentOptions) {
  const comments = ref<Comment[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const eventSource = ref<EventSource | null>(null);

  const apiEndpoint =
    options.apiEndpoint || "http://localhost:3001/api/comments";
  const currentPageUrl = computed(() => window.location.pathname);

  /**
   * Generic error handler wrapper for API calls
   * Handles loading state, error capture, and console logging
   * @param operation - Async operation to execute
   * @param errorMessage - Error message to display on failure
   * @returns Result of operation or null on error
   */
  async function withErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> {
    isLoading.value = true;
    error.value = null;

    try {
      return await operation();
    } catch (err) {
      error.value = err instanceof Error ? err.message : errorMessage;
      console.error(errorMessage, err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch all comments for the current page
   * @returns Promise that resolves when comments are loaded
   */
  async function fetchComments(): Promise<void> {
    await withErrorHandling(async () => {
      const response = await fetch(
        `${apiEndpoint}?pageUrl=${encodeURIComponent(currentPageUrl.value)}`
      );
      const data: ServerResponse<Comment[]> = await response.json();

      if (data.success && data.data) {
        comments.value = data.data;
      } else {
        throw new Error(data.error || "Failed to fetch comments");
      }
    }, "Failed to fetch comments");
  }

  /**
   * Save a new comment
   * @param payload - Comment data to save
   * @returns Promise resolving to the created comment, or null on error
   */
  async function saveComment(payload: CommentPayload): Promise<Comment | null> {
    return withErrorHandling(async () => {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ServerResponse<Comment> = await response.json();

      if (data.success && data.data) {
        // Add to local comments array
        comments.value.push(data.data);
        return data.data;
      } else {
        throw new Error(data.error || "Failed to save comment");
      }
    }, "Failed to save comment");
  }

  /**
   * Update an existing comment's text
   * @param id - Comment ID to update
   * @param text - New comment text
   * @returns Promise resolving to the updated comment, or null on error
   */
  async function updateComment(
    id: string,
    text: string
  ): Promise<Comment | null> {
    return withErrorHandling(async () => {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data: ServerResponse<Comment> = await response.json();

      if (data.success && data.data) {
        // Update in local comments array
        const index = comments.value.findIndex((c) => c.id === id);
        if (index !== -1) {
          comments.value[index] = data.data;
        }
        return data.data;
      } else {
        throw new Error(data.error || "Failed to update comment");
      }
    }, "Failed to update comment");
  }

  /**
   * Delete a comment by ID
   * Now uses consistent error handling pattern with null return on failure
   * @param id - Comment ID to delete
   * @returns Promise resolving to deleted comment object, or null on error
   */
  async function deleteComment(id: string): Promise<Comment | null> {
    return withErrorHandling(async () => {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: "DELETE",
      });

      const data: ServerResponse = await response.json();

      if (data.success) {
        const deletedComment = comments.value.find((c) => c.id === id);
        comments.value = comments.value.filter((c) => c.id !== id);
        return deletedComment || null;
      } else {
        throw new Error(data.error || "Failed to delete comment");
      }
    }, "Failed to delete comment");
  }

  /**
   * Set up live updates using Server-Sent Events (SSE)
   * Automatically syncs comment changes from other users
   */
  function setupLiveUpdates(): void {
    if (!options.enableLiveUpdates) return;

    try {
      const sseUrl = `${apiEndpoint}/stream?pageUrl=${encodeURIComponent(
        currentPageUrl.value
      )}`;
      eventSource.value = new EventSource(sseUrl);

      eventSource.value.addEventListener("comment-added", (event) => {
        const comment: Comment = JSON.parse(event.data);
        // Only add if not already in the list
        if (!comments.value.find((c) => c.id === comment.id)) {
          comments.value.push(comment);
        }
      });

      eventSource.value.addEventListener("comment-updated", (event) => {
        const comment: Comment = JSON.parse(event.data);
        const index = comments.value.findIndex((c) => c.id === comment.id);
        if (index !== -1) {
          comments.value[index] = comment;
        }
      });

      eventSource.value.addEventListener("comment-deleted", (event) => {
        const { id } = JSON.parse(event.data);
        comments.value = comments.value.filter((c) => c.id !== id);
      });

      eventSource.value.onerror = () => {
        console.warn("SSE connection error, will retry...");
      };
    } catch (err) {
      console.error("Failed to setup live updates:", err);
    }
  }

  /**
   * Clean up SSE connection
   * Should be called in component's onUnmounted hook
   */
  function cleanup(): void {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
    }
  }

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    saveComment,
    updateComment,
    deleteComment,
    setupLiveUpdates,
    cleanup,
  };
}
