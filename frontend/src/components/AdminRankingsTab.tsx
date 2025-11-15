import React, { useState, useEffect } from 'react';
import { rankingAPI } from '../services/api';

const AdminRankingsTab: React.FC = () => {
  const [rankings, setRankings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadRankings();
  }, [dateRange]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const response = await rankingAPI.getAll({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 10,
      });
      setRankings(response.data);
    } catch (error) {
      console.error('Load rankings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const formatHours = (hours: number) => {
    return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-lg text-slate-500">Đang tải xếp hạng...</div>
      </div>
    );
  }

  if (!rankings) return null;

  const categories = [
    {
      title: '🏆 Top Giờ làm việc nhiều nhất',
      data: rankings.categories.topByHours,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      getValue: (item: any) => formatHours(item.stats.totalHours),
      getSubtext: (item: any) => `${item.stats.attendanceDays} ngày • ${item.stats.completedWorkLogs} việc hoàn thành`,
    },
    {
      title: '✅ Top Hoàn thành công việc nhiều nhất',
      data: rankings.categories.topByCompletedTasks,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      getValue: (item: any) => `${item.stats.completedWorkLogs} công việc`,
      getSubtext: (item: any) => `${formatHours(item.stats.totalHours)} • Tỷ lệ: ${item.stats.completionRate}%`,
    },
    {
      title: '🎯 Top Tỷ lệ hoàn thành cao nhất',
      data: rankings.categories.topByCompletionRate,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      getValue: (item: any) => `${item.stats.completionRate}%`,
      getSubtext: (item: any) => `${item.stats.completedWorkLogs}/${item.stats.totalWorkLogs} công việc`,
    },
    {
      title: '⏰ Top Chấm công đều đặn nhất',
      data: rankings.categories.topByAttendance,
      color: 'from-orange-600 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      getValue: (item: any) => `${item.stats.attendanceDays} ngày`,
      getSubtext: (item: any) => `${formatHours(item.stats.totalHours)} làm việc`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Khoảng thời gian</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Hiển thị top 10 nhân viên trong mỗi hạng mục
        </p>
      </div>

      {/* Leaderboards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category, catIndex) => (
          <div
            key={catIndex}
            className={`bg-white/80 backdrop-blur-sm rounded-xl border-2 ${category.borderColor} shadow-lg overflow-hidden`}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${category.color} px-6 py-4 text-white`}>
              <h3 className="text-xl font-bold">{category.title}</h3>
              <p className="text-sm text-white/80 mt-1">
                {category.data.length} nhân viên
              </p>
            </div>

            {/* Rankings List */}
            <div className="p-4">
              {category.data.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {category.data.map((item: any, index: number) => (
                    <div
                      key={item.id}
                      className={`${category.bgColor} border ${category.borderColor} rounded-lg p-4 transition-all hover:shadow-md ${
                        index < 3 ? 'ring-2 ring-offset-2 ring-' + category.borderColor : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-2xl font-bold min-w-[40px] text-center">
                            {getMedalEmoji(index)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 text-lg">
                              {item.firstName} {item.lastName}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {item.position} • {item.department}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {category.getSubtext(item)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">
                            {category.getValue(item)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-3">📊 Thống kê tổng quan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{rankings.totalEmployees}</div>
            <div className="text-sm text-slate-600">Tổng nhân viên</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {rankings.categories.topByCompletedTasks[0]?.stats.completedWorkLogs || 0}
            </div>
            <div className="text-sm text-slate-600">Công việc nhiều nhất</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {rankings.categories.topByCompletionRate[0]?.stats.completionRate || 0}%
            </div>
            <div className="text-sm text-slate-600">Tỷ lệ cao nhất</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {rankings.categories.topByHours[0]?.stats.totalHours.toFixed(0) || 0}h
            </div>
            <div className="text-sm text-slate-600">Giờ làm nhiều nhất</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRankingsTab;

