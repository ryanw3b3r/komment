import { Comment, CommentPayload, KommentOptions } from '../types';
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
export declare function useComments(options: KommentOptions): {
    comments: import('vue').Ref<{
        id: string;
        x: number;
        y: number;
        text: string;
        author?: string | undefined;
        timestamp: number;
        pageUrl: string;
        elementSelector?: string | undefined;
        elementOffset?: {
            x: number;
            y: number;
        } | undefined;
    }[], Comment[] | {
        id: string;
        x: number;
        y: number;
        text: string;
        author?: string | undefined;
        timestamp: number;
        pageUrl: string;
        elementSelector?: string | undefined;
        elementOffset?: {
            x: number;
            y: number;
        } | undefined;
    }[]>;
    isLoading: import('vue').Ref<boolean, boolean>;
    error: import('vue').Ref<string | null, string | null>;
    fetchComments: () => Promise<void>;
    saveComment: (payload: CommentPayload) => Promise<Comment | null>;
    updateComment: (id: string, text: string) => Promise<Comment | null>;
    deleteComment: (id: string) => Promise<Comment | null>;
    setupLiveUpdates: () => void;
    cleanup: () => void;
};
