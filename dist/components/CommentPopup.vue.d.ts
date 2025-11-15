type __VLS_Props = {
    modelValue: string;
    position: {
        x: number;
        y: number;
    };
    isLoading?: boolean;
};
declare const _default: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    hover: () => any;
    unhover: () => any;
    cancel: () => any;
    "update:modelValue": (value: string) => any;
    save: () => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onHover?: (() => any) | undefined;
    onUnhover?: (() => any) | undefined;
    onCancel?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
    onSave?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    popupRef: HTMLDivElement;
    textareaRef: HTMLTextAreaElement;
}, HTMLDivElement>;
export default _default;
