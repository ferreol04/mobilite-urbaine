const STYLES = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
};

export default function Alert({ type = 'info', message, onClose }) {
    if (!message) return null;
    return (
        <div className={`border-l-4 p-4 rounded ${STYLES[type]} flex justify-between items-start`}>
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="ml-4 font-bold opacity-60 hover:opacity-100">✕</button>
            )}
        </div>
    );
}
