import { useEffect } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error';
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000); // Auto dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`mb-3 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in ${
        type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
      style={{
        minWidth: '300px',
        maxWidth: '500px',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {type === 'success' ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
