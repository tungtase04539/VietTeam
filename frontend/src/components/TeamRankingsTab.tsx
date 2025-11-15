import React, { useState, useEffect } from 'react';
import { rankingAPI } from '../services/api';

const TeamRankingsTab: React.FC = () => {
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
      const response = await rankingAPI.getTeam({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">🏆 Bảng xếp hạng {rankings.teamName}</h2>
        <p className="text-blue-100">
          Xếp hạng dựa trên số công việc hoàn thành và giờ làm việc
        </p>
      </div>

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
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 text-white">
          <h3 className="text-xl font-bold">📊 Xếp hạng theo hiệu suất</h3>
          <p className="text-sm text-blue-100 mt-1">
            Sắp xếp theo: Công việc hoàn thành → Giờ làm việc
          </p>
        </div>

        <div className="p-6">
          {rankings.rankings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Chưa có dữ liệu xếp hạng</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rankings.rankings.map((member: any, index: number) => (
                <div
                  key={member.id}
                  className={`border-2 rounded-xl p-5 transition-all hover:shadow-lg ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 ring-2 ring-yellow-400'
                      : index === 1
                      ? 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-300'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Rank & Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-4xl font-bold min-w-[60px] text-center">
                        {getMedalEmoji(index)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-slate-900">
                          {member.firstName} {member.lastName}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {member.position}
                        </p>
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {member.stats.completedWorkLogs}
                      </div>
                      <div className="text-sm text-slate-600">công việc</div>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {formatHours(member.stats.totalHours)}
                        </div>
                        <div className="text-xs text-slate-600">Giờ làm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {member.stats.completionRate}%
                        </div>
                        <div className="text-xs text-slate-600">Tỷ lệ hoàn thành</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-600">
                          {member.stats.inProgressWorkLogs}
                        </div>
                        <div className="text-xs text-slate-600">Đang làm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-600">
                          {member.stats.todoWorkLogs}
                        </div>
                        <div className="text-xs text-slate-600">Chưa làm</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Stats Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Thống kê nhóm
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{rankings.totalMembers}</div>
            <div className="text-sm text-slate-600">Thành viên</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {rankings.rankings.reduce((sum: number, m: any) => sum + m.stats.completedWorkLogs, 0)}
            </div>
            <div className="text-sm text-slate-600">Tổng hoàn thành</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                rankings.rankings.reduce((sum: number, m: any) => sum + m.stats.completionRate, 0) /
                  rankings.rankings.length || 0
              )}%
            </div>
            <div className="text-sm text-slate-600">TB tỷ lệ hoàn thành</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(
                rankings.rankings.reduce((sum: number, m: any) => sum + m.stats.totalHours, 0)
              )}h
            </div>
            <div className="text-sm text-slate-600">Tổng giờ làm</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamRankingsTab;

