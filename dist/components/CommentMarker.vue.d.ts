import { Comment } from '../types';
type __VLS_Props = {
    comment: Comment;
};
declare const _default: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    delete: (id: string) => any;
    edit: (comment: Comment) => any;
    hover: () => any;
    unhover: () => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDelete?: ((id: string) => any) | undefined;
    onEdit?: ((comment: Comment) => any) | undefined;
    onHover?: (() => any) | undefined;
    onUnhover?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
