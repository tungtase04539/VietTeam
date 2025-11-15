import React, { useState, useEffect } from 'react';
import { teamAPI, feedbackAPI } from '../services/api';
import { WorkLog, VideoQuality } from '../types';
import { useToast } from '../context/ToastContext';
import VideoFeedbackModal from './VideoFeedbackModal';

const TeamVideosTab: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: '',
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedWorkLog, setSelectedWorkLog] = useState<WorkLog | null>(null);

  useEffect(() => {
    loadVideos();
  }, [filter]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getWorkLogs({
        startDate: filter.startDate,
        endDate: filter.endDate,
        status: filter.status || undefined,
      });

      console.log('Team work logs response:', response.data);
      console.log('Total work logs:', response.data.workLogs.length);

      // Chỉ lấy work logs có video
      const logsWithVideos = response.data.workLogs.filter((log) => log.videoUrl);
      console.log('Work logs with videos:', logsWithVideos.length);
      console.log('Videos:', logsWithVideos);

      setWorkLogs(logsWithVideos);
    } catch (error) {
      console.error('Load videos error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveFeedback = (workLog: WorkLog) => {
    setSelectedWorkLog(workLog);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (data: { videoQuality: VideoQuality; feedbackNote: string }) => {
    if (!selectedWorkLog) return;

    try {
      await feedbackAPI.giveVideoFeedback(selectedWorkLog.id, data);
      showSuccess('Đã gửi feedback thành công!');
      await loadVideos(); // Reload to show feedback
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi gửi feedback');
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TODO: 'bg-gray-100 text-gray-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      BLOCKED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      TODO: 'Chưa làm',
      IN_PROGRESS: 'Đang làm',
      COMPLETED: 'Hoàn thành',
      BLOCKED: 'Bị chặn',
    };
    return texts[status] || status;
  };

  const getQualityBadge = (quality?: string) => {
    if (!quality) return null;
    
    switch (quality) {
      case 'POOR':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">❌ Không đạt</span>;
      case 'GOOD':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✅ Đạt</span>;
      case 'EXCELLENT':
        return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">⭐ Tốt</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-lg text-slate-500">Đang tải videos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">🎥 Video Công Việc Team</h2>
        <p className="text-red-100">Danh sách video minh chứng của các thành viên</p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Lọc video</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Từ ngày</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">Tất cả</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="IN_PROGRESS">Đang làm</option>
              <option value="TODO">Chưa làm</option>
              <option value="BLOCKED">Bị chặn</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Tìm thấy <strong>{workLogs.length}</strong> video
        </p>
      </div>

      {/* Videos Grid */}
      {workLogs.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm p-12 text-center">
          <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-slate-500 text-lg mb-2">Chưa có video nào trong khoảng thời gian này</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Để có video hiển thị:</strong>
              <br />• Nhân viên cần upload video khi thêm/cập nhật công việc
              <br />• Video sẽ tự động xuất hiện ở đây
              <br />• Có thể đã chạy migration database chưa?
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Video Thumbnail */}
              <div className="bg-gradient-to-br from-red-100 to-pink-100 p-8 flex items-center justify-center">
                <svg className="w-20 h-20 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-2">{log.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(log.status)}`}>
                    {getStatusText(log.status)}
                  </span>
                </div>

                {log.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{log.description}</p>
                )}

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {log.employee?.firstName} {log.employee?.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(log.date)}
                  </div>
                  {log.hoursSpent && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {log.hoursSpent}h
                    </div>
                  )}
                  {log.videoFileName && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {log.videoFileName}
                    </div>
                  )}
                </div>

                {/* Feedback Badge */}
                {log.videoQuality && (
                  <div className="mb-3 flex items-center justify-center">
                    {getQualityBadge(log.videoQuality)}
                  </div>
                )}

                {/* Feedback Note */}
                {log.feedbackNote && (
                  <div className="mb-3 p-3 bg-white border border-slate-200 rounded-lg">
                    <p className="text-xs font-semibold text-slate-700 mb-1">💬 Feedback:</p>
                    <p className="text-xs text-slate-600">{log.feedbackNote}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={log.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Xem
                  </a>
                  <button
                    type="button"
                    onClick={() => handleGiveFeedback(log)}
                    className="px-3 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {log.videoQuality ? 'Sửa' : 'Đánh giá'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedWorkLog && (
        <VideoFeedbackModal
          isOpen={showFeedbackModal}
          workLog={{
            id: selectedWorkLog.id,
            title: selectedWorkLog.title,
            videoUrl: selectedWorkLog.videoUrl!,
            videoFileName: selectedWorkLog.videoFileName,
            employeeName: `${selectedWorkLog.employee?.firstName} ${selectedWorkLog.employee?.lastName}`,
          }}
          onSubmit={handleSubmitFeedback}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedWorkLog(null);
          }}
        />
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Thống kê video
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{workLogs.length}</div>
            <div className="text-sm text-slate-600">Tổng video</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {workLogs.filter((l) => l.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-slate-600">Đã hoàn thành</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(workLogs.map((l) => l.employeeId)).size}
            </div>
            <div className="text-sm text-slate-600">Nhân viên</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {workLogs.reduce((sum, l) => sum + (l.hoursSpent || 0), 0).toFixed(1)}h
            </div>
            <div className="text-sm text-slate-600">Tổng giờ</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamVideosTab;

