import React, { useState } from 'react';
import { VideoQuality } from '../types';

interface VideoFeedbackModalProps {
  isOpen: boolean;
  workLog: {
    id: string;
    title: string;
    videoUrl: string;
    videoFileName?: string;
    employeeName: string;
  };
  onSubmit: (data: { videoQuality: VideoQuality; feedbackNote: string }) => Promise<void>;
  onClose: () => void;
}

const VideoFeedbackModal: React.FC<VideoFeedbackModalProps> = ({
  isOpen,
  workLog,
  onSubmit,
  onClose,
}) => {
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const qualities = [
    {
      value: 'POOR' as VideoQuality,
      label: 'Không đạt',
      icon: '❌',
      color: 'border-red-400 bg-red-50 hover:border-red-500',
      selectedColor: 'border-red-600 bg-red-100 ring-2 ring-red-500',
      textColor: 'text-red-700',
    },
    {
      value: 'GOOD' as VideoQuality,
      label: 'Đạt',
      icon: '✅',
      color: 'border-green-400 bg-green-50 hover:border-green-500',
      selectedColor: 'border-green-600 bg-green-100 ring-2 ring-green-500',
      textColor: 'text-green-700',
    },
    {
      value: 'EXCELLENT' as VideoQuality,
      label: 'Tốt',
      icon: '⭐',
      color: 'border-yellow-400 bg-yellow-50 hover:border-yellow-500',
      selectedColor: 'border-yellow-600 bg-yellow-100 ring-2 ring-yellow-500',
      textColor: 'text-yellow-700',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuality) return;

    setLoading(true);
    try {
      await onSubmit({ videoQuality: selectedQuality, feedbackNote });
      setSelectedQuality(null);
      setFeedbackNote('');
      onClose();
    } catch (error) {
      console.error('Submit feedback error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-pink-600">
          <h3 className="text-2xl font-bold text-white">Đánh giá Video</h3>
          <p className="text-purple-100 text-sm mt-1">Đánh giá chất lượng video và gửi feedback cho nhân viên</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Work Log Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">{workLog.title}</h4>
            <p className="text-sm text-slate-600">👤 {workLog.employeeName}</p>
            {workLog.videoFileName && (
              <p className="text-xs text-slate-500 mt-1">📹 {workLog.videoFileName}</p>
            )}
            <a
              href={workLog.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Xem video trước khi đánh giá
            </a>
          </div>

          {/* Quality Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Chất lượng video <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {qualities.map((quality) => (
                <button
                  key={quality.value}
                  type="button"
                  onClick={() => setSelectedQuality(quality.value)}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    selectedQuality === quality.value ? quality.selectedColor : quality.color
                  }`}
                >
                  <div className="text-4xl mb-2">{quality.icon}</div>
                  <div className={`font-semibold ${quality.textColor}`}>{quality.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Note */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nhận xét chi tiết (Tùy chọn)
            </label>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Nhận xét về chất lượng video, nội dung, góp ý cải thiện..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!selectedQuality || loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : '✓ Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoFeedbackModal;

