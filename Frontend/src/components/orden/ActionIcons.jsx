const strokeProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
};

export const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...strokeProps} />
        <path d="M7 10l5 5 5-5" {...strokeProps} />
        <path d="M12 15V3" {...strokeProps} />
    </svg>
);

export const EditIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 20h9" {...strokeProps} />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" {...strokeProps} />
    </svg>
);

export const TrashIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 6h18" {...strokeProps} />
        <path d="M8 6V4h8v2" {...strokeProps} />
        <path d="M6 6l1 14h10l1-14" {...strokeProps} />
        <path d="M10 11v6" {...strokeProps} />
        <path d="M14 11v6" {...strokeProps} />
    </svg>
);
