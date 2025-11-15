import React, { useState, useEffect } from 'react';
import { teamAPI } from '../services/api';
import { WorkLog } from '../types';

const TeamVideosTab: React.FC = () => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: '',
  });

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

      // Chỉ lấy work logs có video
      const logsWithVideos = response.data.workLogs.filter((log) => log.videoUrl);
      setWorkLogs(logsWithVideos);
    } catch (error) {
      console.error('Load videos error:', error);
    } finally {
      setLoading(false);
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
          <p className="text-slate-500 text-lg">Chưa có video nào trong khoảng thời gian này</p>
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

                <a
                  href={log.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Xem video
                </a>
              </div>
            </div>
          ))}
        </div>
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

