import { ref, computed } from "vue";
import type {
  Comment,
  CommentPayload,
  ServerResponse,
  KommentOptions,
} from "../types";

export function useComments(options: KommentOptions) {
  const comments = ref<Comment[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const eventSource = ref<EventSource | null>(null);

  const apiEndpoint =
    options.apiEndpoint || "http://localhost:3001/api/comments";
  const currentPageUrl = computed(() => window.location.pathname);

  // Fetch all comments for current page
  async function fetchComments() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${apiEndpoint}?pageUrl=${encodeURIComponent(currentPageUrl.value)}`
      );
      const data: ServerResponse<Comment[]> = await response.json();

      if (data.success && data.data) {
        comments.value = data.data;
      } else {
        throw new Error(data.error || "Failed to fetch comments");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to fetch comments:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // Save a new comment
  async function saveComment(payload: CommentPayload): Promise<Comment | null> {
    isLoading.value = true;
    error.value = null;

    try {
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
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to save comment:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // Update a comment
  async function updateComment(
    id: string,
    text: string
  ): Promise<Comment | null> {
    isLoading.value = true;
    error.value = null;

    try {
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
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to update comment:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // Delete a comment
  async function deleteComment(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: "DELETE",
      });

      const data: ServerResponse = await response.json();

      if (data.success) {
        comments.value = comments.value.filter((c) => c.id !== id);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete comment:", err);
      return false;
    }
  }

  // Set up live updates using Server-Sent Events
  function setupLiveUpdates() {
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

  // Clean up SSE connection
  function cleanup() {
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
