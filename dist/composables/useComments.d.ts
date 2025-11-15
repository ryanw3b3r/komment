import { Comment, CommentPayload, KommentOptions } from '../types';
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
    deleteComment: (id: string) => Promise<boolean>;
    setupLiveUpdates: () => void;
    cleanup: () => void;
};
