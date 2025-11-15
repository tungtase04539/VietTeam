import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamAPI, authAPI } from '../services/api';
import { Team, WorkLog, User } from '../types';
import { useToast } from '../context/ToastContext';
import TeamRankingsTab from '../components/TeamRankingsTab';
import TeamVideosTab from '../components/TeamVideosTab';

type TabType = 'overview' | 'rankings' | 'videos';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamWorkLogs, setTeamWorkLogs] = useState<WorkLog[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [workLogStats, setWorkLogStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAssignWorkModal, setShowAssignWorkModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [workItems, setWorkItems] = useState<Array<{
    id: string;
    title: string;
    description: string;
  }>>([{ id: '1', title: '', description: '' }]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, teamRes] = await Promise.all([
        authAPI.getProfile(),
        teamAPI.getMyTeam(),
      ]);

      setUser(profileRes.data);
      setTeam(teamRes.data.managedTeam || null);

      if (teamRes.data.managedTeam) {
        // Load all team data
        await Promise.all([
          loadTeamWorkLogs(),
          loadAttendanceSummary(),
          loadWorkLogStats(),
        ]);
      }
    } catch (error: any) {
      console.error('Load data error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSummary = async () => {
    try {
      const res = await teamAPI.getAttendanceSummary();
      setAttendanceSummary(res.data);
    } catch (error) {
      console.error('Load attendance summary error:', error);
    }
  };

  const loadWorkLogStats = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30); // Last 30 days

      const res = await teamAPI.getWorkLogStats({
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      });
      setWorkLogStats(res.data);
    } catch (error) {
      console.error('Load work log stats error:', error);
    }
  };

  const loadTeamWorkLogs = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // Last 7 days

      const res = await teamAPI.getWorkLogs({
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      });

      setTeamWorkLogs(res.data.workLogs);
    } catch (error) {
      console.error('Load team work logs error:', error);
    }
  };

  const handleAssignWork = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (selectedEmployees.length === 0) {
      showError('Vui lòng chọn ít nhất một nhân viên');
      return;
    }

    // Validate work items
    const validWorkItems = workItems.filter((item) => item.title.trim() !== '');
    if (validWorkItems.length === 0) {
      showError('Vui lòng nhập ít nhất một công việc');
      return;
    }

    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    try {
      let totalCreated = 0;
      
      // Giao từng công việc
      for (const workItem of validWorkItems) {
        const response = await teamAPI.assignWork({
          employeeIds: selectedEmployees,
          title: workItem.title,
          description: workItem.description,
          startDate,
          endDate,
        });
        totalCreated += response.data.summary.totalWorkLogs;
      }

      setShowAssignWorkModal(false);
      setSelectedEmployees([]);
      setWorkItems([{ id: '1', title: '', description: '' }]);
      
      const start = new Date(startDate);
      const end = new Date(endDate || startDate);
      const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      showSuccess(
        `Đã giao ${totalCreated} công việc (${validWorkItems.length} loại × ${selectedEmployees.length} người × ${dayCount} ngày)`
      );
      
      // Reload all data
      await Promise.all([
        loadTeamWorkLogs(),
        loadWorkLogStats(),
      ]);
    } catch (error: any) {
      console.error('Assign work error:', error);
      showError(error.response?.data?.message || 'Lỗi khi giao việc');
    }
  };

  const addWorkItem = () => {
    setWorkItems([...workItems, { id: Date.now().toString(), title: '', description: '' }]);
  };

  const removeWorkItem = (id: string) => {
    if (workItems.length === 1) return; // Keep at least 1
    setWorkItems(workItems.filter((item) => item.id !== id));
  };

  const updateWorkItem = (id: string, field: 'title' | 'description', value: string) => {
    setWorkItems(workItems.map((item) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === team?.members.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(team?.members.map((m) => m.id) || []);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Bảng điều khiển Quản lý
              </h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              Chưa được phân nhóm
            </h2>
            <p className="text-yellow-700">
              Bạn chưa được phân vào nhóm nào hoặc chưa được giao quyền quản lý nhóm.
              Vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'IN_PROGRESS':
        return 'Đang làm';
      case 'TODO':
        return 'Chưa làm';
      case 'BLOCKED':
        return 'Bị chặn';
      default:
        return status;
    }
  };

  // Calculate team statistics
  const teamStats = {
    totalMembers: team.members.length,
    totalTasks: teamWorkLogs.length,
    completedTasks: teamWorkLogs.filter((log) => log.status === 'COMPLETED').length,
    inProgressTasks: teamWorkLogs.filter((log) => log.status === 'IN_PROGRESS').length,
    todoTasks: teamWorkLogs.filter((log) => log.status === 'TODO').length,
    totalHours: teamWorkLogs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Bảng điều khiển Quản lý
              </h1>
              <p className="text-sm text-gray-600">
                {user?.employee?.firstName} {user?.employee?.lastName} - {team.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rankings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏆 Xếp hạng
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'videos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎥 Videos
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Team Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Nhóm: {team.name}</h2>
            <button
              onClick={() => setShowAssignWorkModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Giao việc mới
            </button>
          </div>

          {team.description && (
            <p className="text-gray-600 mb-4">{team.description}</p>
          )}

          {/* Attendance Statistics */}
          {attendanceSummary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Chấm công hôm nay</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {attendanceSummary.today.checkedIn}/{attendanceSummary.today.totalTeamMembers}
                  </div>
                  <div className="text-sm text-gray-600">Đã check-in</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {attendanceSummary.today.currentlyWorking}
                  </div>
                  <div className="text-sm text-gray-600">Đang làm việc</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendanceSummary.today.attendanceRate}%
                  </div>
                  <div className="text-sm text-gray-600">Tỷ lệ chấm công</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {attendanceSummary.thisMonth.totalHours.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600">Giờ tháng này</div>
                </div>
              </div>
            </div>
          )}

          {/* Work Log Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Công việc (30 ngày qua)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {workLogStats?.overall.totalLogs || teamStats.totalTasks}
                </div>
                <div className="text-sm text-gray-600">Tổng công việc</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {workLogStats?.overall.completedTasks || teamStats.completedTasks}
                </div>
                <div className="text-sm text-gray-600">Đã hoàn thành</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {workLogStats?.overall.inProgressTasks || teamStats.inProgressTasks}
                </div>
                <div className="text-sm text-gray-600">Đang làm</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {workLogStats?.overall.completionRate || 0}%
                </div>
                <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <h3 className="text-lg font-semibold mb-3">Thành viên nhóm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.map((member) => {
              const memberTasks = teamWorkLogs.filter(
                (log) => log.employeeId === member.id
              );
              const memberHours = memberTasks.reduce(
                (sum, log) => sum + (log.hoursSpent || 0),
                0
              );

              return (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{member.position}</p>
                  <p className="text-sm text-gray-500">{member.department}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">
                      {memberTasks.length} công việc - {memberHours.toFixed(1)}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Work Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Công việc nhóm (7 ngày gần đây)
          </h2>

          {teamWorkLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Chưa có công việc nào được ghi nhận
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nhân viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Công việc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giờ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamWorkLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.employee?.firstName} {log.employee?.lastName}
                        </div>
                        {log.assignedBy && (
                          <div className="text-xs text-gray-500">
                            Giao bởi: {log.assignedBy.firstName}{' '}
                            {log.assignedBy.lastName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.title}</div>
                        {log.description && (
                          <div className="text-xs text-gray-500">
                            {log.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                            log.status
                          )}`}
                        >
                          {getStatusLabel(log.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.hoursSpent ? `${log.hoursSpent}h` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.date).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}

        {/* Rankings Tab */}
        {activeTab === 'rankings' && <TeamRankingsTab />}

        {/* Videos Tab */}
        {activeTab === 'videos' && <TeamVideosTab />}
      </div>

      {/* Assign Work Modal */}
      {showAssignWorkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h3 className="text-2xl font-bold text-white">Giao việc mới</h3>
              <p className="text-blue-100 text-sm mt-1">Giao công việc cho nhiều nhân viên và thiết lập lịch lặp lại</p>
            </div>

            <form onSubmit={handleAssignWork} className="p-6 space-y-6">
              {/* Employee Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Chọn nhân viên <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={selectAllEmployees}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedEmployees.length === team.members.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
                <div className="border-2 border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {team.members.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(member.id)}
                        onChange={() => toggleEmployeeSelection(member.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-slate-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-slate-500">{member.position}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Đã chọn: <span className="font-semibold text-blue-600">{selectedEmployees.length}</span> nhân viên
                </p>
              </div>

              {/* Work Items - Dynamic List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Danh sách công việc <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addWorkItem}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm công việc
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {workItems.map((item, index) => (
                    <div key={item.id} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-slate-700">Công việc #{index + 1}</h4>
                        {workItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWorkItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Xóa công việc này"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Tiêu đề <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateWorkItem(item.id, 'title', e.target.value)}
                            required
                            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="VD: Hoàn thành báo cáo"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Mô tả
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) => updateWorkItem(item.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Mô tả chi tiết..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Thời gian thực hiện
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Từ ngày <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Đến ngày</label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Công việc sẽ được tạo cho mỗi ngày trong khoảng thời gian này
                </p>
              </div>

              {/* Summary Box */}
              {selectedEmployees.length > 0 && workItems.filter(w => w.title.trim()).length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Tóm tắt sẽ giao:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Số loại công việc: <span className="font-bold">{workItems.filter(w => w.title.trim()).length}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Số nhân viên: <span className="font-bold">{selectedEmployees.length}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Mỗi công việc sẽ giao cho tất cả nhân viên đã chọn
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Nếu chọn nhiều ngày, mỗi công việc sẽ lặp lại mỗi ngày
                    </li>
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignWorkModal(false);
                    setSelectedEmployees([]);
                    setWorkItems([{ id: '1', title: '', description: '' }]);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={selectedEmployees.length === 0 || workItems.filter(w => w.title.trim()).length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Giao {workItems.filter(w => w.title.trim()).length} việc cho {selectedEmployees.length} người
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
