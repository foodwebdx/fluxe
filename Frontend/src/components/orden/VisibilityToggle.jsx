const VisibilityToggle = ({ isPublic, onToggle, disabled = false, title }) => {
    const label = title || (isPublic ? 'Visible para cliente' : 'Oculto para cliente');

    return (
        <button
            type="button"
            className="btn-icon visibility-toggle"
            onClick={onToggle}
            disabled={disabled}
            aria-pressed={isPublic}
            aria-label={label}
            title={label}
        >
            {isPublic ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M4 4l16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </button>
    );
};

export default VisibilityToggle;
