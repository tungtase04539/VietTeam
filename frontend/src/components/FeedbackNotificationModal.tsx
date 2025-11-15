import React from 'react';
import { WorkLog } from '../types';

interface FeedbackNotificationModalProps {
  isOpen: boolean;
  feedbacks: WorkLog[];
  onClose: () => void;
  onMarkSeen: () => void;
}

const FeedbackNotificationModal: React.FC<FeedbackNotificationModalProps> = ({
  isOpen,
  feedbacks,
  onClose,
  onMarkSeen,
}) => {
  if (!isOpen || feedbacks.length === 0) return null;

  const getQualityStyle = (quality?: string) => {
    switch (quality) {
      case 'POOR':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: '❌',
          label: 'Không đạt',
        };
      case 'GOOD':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-700',
          icon: '✅',
          label: 'Đạt',
        };
      case 'EXCELLENT':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          icon: '⭐',
          label: 'Tốt',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: '📝',
          label: 'Chưa đánh giá',
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold">📬 Feedback Video Mới</h3>
              <p className="text-blue-100 mt-1">
                Bạn có {feedbacks.length} feedback mới từ quản lý
              </p>
            </div>
          </div>
        </div>

        {/* Feedbacks List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {feedbacks.map((feedback) => {
            const qualityStyle = getQualityStyle(feedback.videoQuality);
            
            return (
              <div
                key={feedback.id}
                className={`border-2 ${qualityStyle.border} ${qualityStyle.bg} rounded-xl p-5 transition-all hover:shadow-lg`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{feedback.title}</h4>
                    <p className="text-sm text-slate-600">
                      📅 {formatDate(feedback.date)}
                    </p>
                  </div>
                  <div className={`px-4 py-2 ${qualityStyle.bg} border-2 ${qualityStyle.border} rounded-lg`}>
                    <div className="text-3xl mb-1">{qualityStyle.icon}</div>
                    <div className={`text-sm font-bold ${qualityStyle.text}`}>
                      {qualityStyle.label}
                    </div>
                  </div>
                </div>

                {/* Feedback Note */}
                {feedback.feedbackNote && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3">
                    <p className="text-sm font-semibold text-slate-700 mb-2">💬 Nhận xét:</p>
                    <p className="text-slate-600 leading-relaxed">{feedback.feedbackNote}</p>
                  </div>
                )}

                {/* Feedback Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                  <span>Đánh giá lúc: {formatDate(feedback.feedbackAt)}</span>
                  <a
                    href={feedback.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Xem lại video →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => {
              onMarkSeen();
              onClose();
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            ✓ Đã hiểu, đóng thông báo
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackNotificationModal;

