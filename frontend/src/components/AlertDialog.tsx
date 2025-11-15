import React from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  buttonText?: string;
  onClose: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  buttonText = 'Đóng',
  onClose,
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          buttonClass: 'bg-green-600 hover:bg-green-700',
        };
      case 'error':
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          buttonClass: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          ),
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
        };
      default:
        return {
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          buttonClass: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const { icon, bgColor, textColor, buttonClass } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-6 h-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icon}
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 text-white font-semibold rounded-lg transition-colors shadow-lg ${buttonClass}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;

