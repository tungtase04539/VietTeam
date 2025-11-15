import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { attendanceAPI, workLogAPI } from '../services/api';
import WorkLogRequiredModal from '../components/WorkLogRequiredModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Attendance,
  WorkLog,
  AttendanceStatistics,
  WorkLogStatistics,
  CreateWorkLogData,
  WorkLogStatus,
  TodayAttendanceResponse,
  CheckOutResponse,
} from '../types';

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const employee = user?.employee;

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [totalHoursToday, setTotalHoursToday] = useState<number>(0);
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [currentHours, setCurrentHours] = useState<number>(0);

  // Work logs state
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [workLogStats, setWorkLogStats] = useState<WorkLogStatistics | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [workLogLoading, setWorkLogLoading] = useState(false);

  // Attendance stats
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStatistics | null>(null);

  // 30-minute warning modal state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [actualWorkHours, setActualWorkHours] = useState<number>(0);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  // Work log required modal state (new)
  const [showWorkLogRequiredModal, setShowWorkLogRequiredModal] = useState(false);
  const [workLogRequiredDetails, setWorkLogRequiredDetails] = useState<any>(null);

  // Confirm dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workLogToDelete, setWorkLogToDelete] = useState<string | null>(null);

  // Load today's attendance
  useEffect(() => {
    loadTodayAttendance();
    loadWorkLogs();
    loadAttendanceStats();
  }, []);

  // Live hours counter
  useEffect(() => {
    if (todayAttendance?.checkInTime && !todayAttendance.checkOutTime) {
      const interval = setInterval(() => {
        const checkIn = new Date(todayAttendance.checkInTime!);
        const now = new Date();
        const hours = (now.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        setCurrentHours(hours);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [todayAttendance]);

  // Check 30-minute warning after checkout
  useEffect(() => {
    const checkWarning = () => {
      const lastCheckOut = localStorage.getItem('lastCheckOutTime');
      const lastCheckIn = localStorage.getItem('lastCheckInTime');

      if (!lastCheckOut || !lastCheckIn) return;

      const now = new Date();
      const checkOutDate = new Date(lastCheckOut);
      const checkInDate = new Date(lastCheckIn);
      const minutesSinceCheckout = (now.getTime() - checkOutDate.getTime()) / (1000 * 60);

      // Nếu đã qua 30 phút kể từ lúc checkout
      if (minutesSinceCheckout >= 30 && !showWarningModal) {
        // Tính thời gian thực đã làm (từ check-in đến check-out)
        const actualHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
        setActualWorkHours(actualHours);
        setCheckOutTime(lastCheckOut);
        setShowWarningModal(true);
      }
    };

    // Check mỗi phút
    const interval = setInterval(checkWarning, 60000);

    // Check ngay lập tức khi component mount
    checkWarning();

    return () => clearInterval(interval);
  }, [showWarningModal]);

  const loadTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getToday();
      const data = response.data as TodayAttendanceResponse;
      setTodayAttendance(data.attendance);
      setTotalHoursToday(data.totalHoursToday || 0);
      setSessionsCount(data.sessionsCount || 0);
    } catch (error: any) {
      console.error('Error loading attendance:', error);
    }
  };

  const loadWorkLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading work logs for date:', today);
      const response = await workLogAPI.getMyLogs({
        startDate: today,
        endDate: today,
      });
      console.log('Work logs loaded:', response.data);
      setWorkLogs(response.data.workLogs);
      setWorkLogStats(response.data.statistics);
    } catch (error: any) {
      console.error('Error loading work logs:', error);
      throw error; // Re-throw để catch bên ngoài biết
    }
  };

  const loadAttendanceStats = async () => {
    try {
      const response = await attendanceAPI.getMyRecords();
      setAttendanceStats(response.data.statistics);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      const response = await attendanceAPI.checkIn();
      setTodayAttendance(response.data.attendance);
      await loadTodayAttendance(); // Reload to get all sessions
      showSuccess('Bắt đầu làm việc thành công!');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi bắt đầu làm việc');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async (forceCheckout = false) => {
    setAttendanceLoading(true);
    try {
      const response = await attendanceAPI.checkOut(undefined, forceCheckout);
      const data = response.data as CheckOutResponse;
      setTodayAttendance(data.attendance);
      setCurrentHours(0);

      // Lưu thời gian checkout và thời gian thực làm việc vào localStorage để check sau 30 phút
      const checkOutTimestamp = new Date().toISOString();
      localStorage.setItem('lastCheckOutTime', checkOutTimestamp);
      localStorage.setItem('lastCheckInTime', todayAttendance?.checkInTime || '');
      setCheckOutTime(checkOutTimestamp);

      showSuccess('Kết thúc làm việc thành công!');
      
      await loadTodayAttendance(); // Reload to get all sessions
      loadAttendanceStats(); // Reload stats
      
      // Đóng modal nếu đang mở
      setShowWorkLogRequiredModal(false);
      setWorkLogRequiredDetails(null);
    } catch (error: any) {
      // Xử lý trường hợp yêu cầu work log
      console.log('Checkout error:', error);
      console.log('Error response:', error.response);
      console.log('Error data:', error.response?.data);
      
      if (error.response?.status === 400 && error.response?.data?.requiresWorkLog) {
        console.log('Showing WorkLog Required Modal with details:', error.response.data.details);
        setWorkLogRequiredDetails(error.response.data.details);
        setShowWorkLogRequiredModal(true);
        // Không set loading về false ở đây để modal có thể hiển thị
      } else {
        showError(error.response?.data?.message || 'Lỗi khi kết thúc làm việc');
        setAttendanceLoading(false);
      }
    }
  };

  const handleAddWorkLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWorkLogLoading(true);

    // Lưu reference của form trước khi async operations
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: CreateWorkLogData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      hoursSpent: parseFloat(formData.get('hoursSpent') as string) || undefined,
      status: (formData.get('status') as WorkLogStatus) || 'TODO',
    };

    try {
      console.log('Creating work log with data:', data);
      await workLogAPI.create(data);
      console.log('Work log created successfully');

      form.reset();
      setShowAddModal(false);
      setShowWarningModal(false); // Đóng warning modal nếu đang mở

      // Clear localStorage tracking vì đã update work log
      localStorage.removeItem('lastCheckOutTime');
      localStorage.removeItem('lastCheckInTime');

      showSuccess('Đã thêm công việc!');

      // Load lại work logs sau khi đóng modal
      try {
        await loadWorkLogs();
        console.log('Work logs reloaded successfully');
      } catch (reloadError) {
        console.error('Error reloading work logs:', reloadError);
        showError('Đã thêm công việc nhưng không thể tải lại danh sách. Vui lòng refresh trang.');
      }
    } catch (error: any) {
      console.error('Add work log error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      showError(error.response?.data?.message || 'Lỗi khi thêm công việc');
    } finally {
      setWorkLogLoading(false);
    }
  };

  const handleUpdateWorkLogStatus = async (id: string, status: WorkLogStatus) => {
    try {
      await workLogAPI.update(id, { status });

      // Clear localStorage tracking vì đã update work log
      localStorage.removeItem('lastCheckOutTime');
      localStorage.removeItem('lastCheckInTime');

      loadWorkLogs();
      showSuccess('Cập nhật trạng thái thành công!');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi cập nhật');
    }
  };

  const handleDeleteWorkLog = (id: string) => {
    setWorkLogToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteWorkLog = async () => {
    if (!workLogToDelete) return;
    try {
      await workLogAPI.delete(workLogToDelete);
      loadWorkLogs();
      showSuccess('Xóa công việc thành công!');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi xóa');
    } finally {
      setShowDeleteConfirm(false);
      setWorkLogToDelete(null);
    }
  };

  // Handle work log submission from WorkLogRequiredModal
  const handleWorkLogRequiredSubmit = async (data: CreateWorkLogData) => {
    try {
      console.log('Submitting work log from modal:', data);
      await workLogAPI.create(data);
      showSuccess('Đã thêm công việc!');
      
      // Reload work logs
      await loadWorkLogs();
      
      // Tự động retry checkout sau khi thêm work log thành công
      await handleCheckOut(false);
    } catch (error: any) {
      console.error('Add work log error:', error);
      showError(error.response?.data?.message || 'Lỗi khi thêm công việc');
      setAttendanceLoading(false);
      throw error; // Re-throw to let modal know
    }
  };

  // Handle force checkout (skip work log requirement)
  const handleForceCheckout = async () => {
    console.log('Force checkout requested');
    await handleCheckOut(true);
  };
  
  // Handle close modal
  const handleCloseWorkLogModal = () => {
    setShowWorkLogRequiredModal(false);
    setWorkLogRequiredDetails(null);
    setAttendanceLoading(false);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTimerDisplay = (hours: number) => {
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0'),
    };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PRESENT: 'bg-green-100 text-green-800',
      LATE: 'bg-yellow-100 text-yellow-800',
      ABSENT: 'bg-red-100 text-red-800',
      WORK_FROM_HOME: 'bg-purple-100 text-purple-800',
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      BLOCKED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PRESENT: 'Đúng giờ',
      LATE: 'Đi muộn',
      ABSENT: 'Vắng',
      WORK_FROM_HOME: 'Làm từ xa',
      TODO: 'Chưa làm',
      IN_PROGRESS: 'Đang làm',
      COMPLETED: 'Hoàn thành',
      BLOCKED: 'Bị chặn',
    };
    return texts[status] || status;
  };

  const isWorking = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
  const timerDisplay = formatTimerDisplay(currentHours);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-light text-slate-900">
                Dashboard <span className="font-medium text-emerald-600">Nhân Viên</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">Chấm công & Theo dõi công việc</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">
                  {employee?.firstName} {employee?.lastName}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900
                         border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Time Tracker Card - Prominent Display */}
        <div className="mb-8">
          {isWorking ? (
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl p-8 shadow-2xl">
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium text-sm">Đang làm việc</span>
                  </div>
                </div>

                {/* Large Timer Display */}
                <div className="mb-6">
                  <div className="flex justify-center items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[120px]">
                      <div className="text-6xl font-bold text-white mb-2">
                        {timerDisplay.hours}
                      </div>
                      <div className="text-emerald-100 text-sm font-medium">Giờ</div>
                    </div>
                    <div className="text-4xl text-white font-light">:</div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[120px]">
                      <div className="text-6xl font-bold text-white mb-2">
                        {timerDisplay.minutes}
                      </div>
                      <div className="text-emerald-100 text-sm font-medium">Phút</div>
                    </div>
                    <div className="text-4xl text-white font-light">:</div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[120px]">
                      <div className="text-6xl font-bold text-white mb-2">
                        {timerDisplay.seconds}
                      </div>
                      <div className="text-emerald-100 text-sm font-medium">Giây</div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mb-6 space-y-2">
                  <p className="text-emerald-50 text-lg">
                    Bắt đầu lúc: <span className="font-semibold text-white">{formatTime(todayAttendance.checkInTime)}</span>
                  </p>
                  <p className="text-emerald-50">
                    {new Date().toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* End Work Button */}
                <button
                  onClick={() => handleCheckOut(false)}
                  disabled={attendanceLoading}
                  className="px-8 py-4 bg-white text-emerald-600 font-semibold text-lg rounded-xl
                           hover:bg-emerald-50 transition-all duration-200 shadow-xl hover:shadow-2xl
                           disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {attendanceLoading ? 'Đang xử lý...' : '⏹️ Kết thúc làm việc'}
                </button>

                {/* Status Badge */}
                {todayAttendance.status && (
                  <div className="mt-6">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                        todayAttendance.status
                      )}`}
                    >
                      {getStatusText(todayAttendance.status)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-3xl p-8 shadow-lg border border-slate-200">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-12 h-12 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-light text-slate-900 mb-2">
                    Chào {employee?.firstName}!
                  </h2>
                  <p className="text-slate-500">
                    {new Date().toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {todayAttendance?.checkOutTime ? (
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-green-800 font-medium text-sm">
                        Đã hoàn thành làm việc hôm nay
                      </span>
                    </div>
                    <p className="text-slate-700 mb-2">
                      Tổng thời gian: <span className="font-bold text-emerald-600 text-xl">{formatHours(totalHoursToday)}</span>
                      {sessionsCount > 1 && (
                        <span className="text-sm text-slate-500 ml-2">({sessionsCount} sessions)</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      Session cuối: {formatTime(todayAttendance.checkInTime)} - {formatTime(todayAttendance.checkOutTime)}
                    </p>
                    <button
                      onClick={handleCheckIn}
                      disabled={attendanceLoading}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm
                               font-medium rounded-lg hover:bg-blue-700
                               transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {attendanceLoading ? 'Đang xử lý...' : '▶️ Bắt đầu session mới'}
                    </button>
                  </div>
                ) : (
                  <div className="mb-6">
                    {sessionsCount > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Tổng thời gian hôm nay: <span className="font-bold">{formatHours(totalHoursToday)}</span>
                          <span className="ml-2">({sessionsCount} sessions hoàn thành)</span>
                        </p>
                      </div>
                    )}
                    <button
                      onClick={handleCheckIn}
                      disabled={attendanceLoading}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white
                               font-semibold text-lg rounded-xl hover:from-emerald-700 hover:to-teal-700
                               transition-all duration-200 shadow-lg hover:shadow-xl
                               disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {attendanceLoading ? 'Đang xử lý...' : sessionsCount > 0 ? '▶️ Bắt đầu session mới' : '▶️ Bắt đầu làm việc'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Giờ làm tháng này</p>
                <p className="text-3xl font-light text-slate-900">
                  {attendanceStats?.totalHours ? formatHours(attendanceStats.totalHours) : '0h 0m'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Công việc hoàn thành</p>
                <p className="text-3xl font-light text-slate-900">
                  {workLogStats?.completedTasks || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Tỷ lệ hoàn thành</p>
                <p className="text-3xl font-light text-slate-900">
                  {workLogStats?.completionRate
                    ? `${Math.round(workLogStats.completionRate)}%`
                    : '0%'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Work Logs Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-slate-900">Công việc hôm nay</h2>
              <p className="text-sm text-slate-500 mt-1">Quản lý các task đang thực hiện</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg
                       hover:bg-emerald-700 transition-all duration-200 shadow-sm"
            >
              + Thêm công việc
            </button>
          </div>

          <div className="p-6">
            {workLogs.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-slate-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-slate-500">Chưa có công việc nào hôm nay</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Header with title and delete button */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg mb-1">{log.title}</h3>
                        {log.description && (
                          <p className="text-sm text-slate-600 mt-2">{log.description}</p>
                        )}
                        {log.hoursSpent && (
                          <p className="text-sm text-slate-500 mt-2">
                            ⏱️ Thời gian: {formatHours(log.hoursSpent)}
                          </p>
                        )}
                        {log.assignedBy && (
                          <p className="text-xs text-blue-600 mt-1">
                            📋 Giao bởi: {log.assignedBy.firstName} {log.assignedBy.lastName}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteWorkLog(log.id)}
                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Status Buttons - Large and centered */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-3 text-center font-medium">
                        TRẠNG THÁI CÔNG VIỆC
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => handleUpdateWorkLogStatus(log.id, 'TODO')}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                            log.status === 'TODO'
                              ? 'bg-gray-500 text-white shadow-md scale-105'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Chưa làm</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleUpdateWorkLogStatus(log.id, 'IN_PROGRESS')}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                            log.status === 'IN_PROGRESS'
                              ? 'bg-blue-500 text-white shadow-md scale-105'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Đang làm</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleUpdateWorkLogStatus(log.id, 'COMPLETED')}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                            log.status === 'COMPLETED'
                              ? 'bg-green-500 text-white shadow-md scale-105'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Hoàn thành</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Work Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900">Thêm công việc mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddWorkLog} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Tên công việc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Chi tiết công việc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số giờ dự kiến
                </label>
                <input
                  type="number"
                  name="hoursSpent"
                  step="0.5"
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="VD: 2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="TODO">Chưa làm</option>
                  <option value="IN_PROGRESS">Đang làm</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="BLOCKED">Bị chặn</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={workLogLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {workLogLoading ? 'Đang thêm...' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Log Required Modal (New) */}
      {showWorkLogRequiredModal && workLogRequiredDetails && (
        <WorkLogRequiredModal
          isOpen={showWorkLogRequiredModal}
          onClose={handleCloseWorkLogModal}
          onSubmit={handleWorkLogRequiredSubmit}
          onForceCheckout={handleForceCheckout}
          details={workLogRequiredDetails}
        />
      )}

      {/* 30-Minute Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-red-500">
            {/* Red Warning Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6 text-white">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">⚠️ CẢNH BÁO QUAN TRỌNG</h3>
                  <p className="text-red-100 text-sm">Bạn đã kết thúc làm việc hơn 30 phút mà chưa cập nhật công việc!</p>
                </div>
              </div>
            </div>

            {/* Warning Content */}
            <div className="px-6 py-6 bg-red-50 border-b-2 border-red-200">
              <div className="space-y-4">
                <div className="bg-white border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                  <h4 className="font-bold text-red-900 mb-2 text-lg">📊 Thông tin thời gian làm việc:</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-700">
                      <span className="font-semibold">⏰ Thời gian check-out:</span>{' '}
                      <span className="text-red-600 font-bold">
                        {checkOutTime ? new Date(checkOutTime).toLocaleString('vi-VN') : 'N/A'}
                      </span>
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">⏱️ Thời gian thực đã làm:</span>{' '}
                      <span className="text-emerald-600 font-bold text-lg">
                        {formatHours(actualWorkHours)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
                  <p className="text-red-900 font-semibold mb-2">⚠️ CẢNH BÁO:</p>
                  <p className="text-red-800 text-sm leading-relaxed">
                    Nếu bạn không cập nhật công việc ngay bây giờ, hệ thống sẽ chỉ tính{' '}
                    <span className="font-bold underline">thời gian thực làm việc từ khi bắt đầu đến lúc cập nhật work log mới nhất</span>.
                    Thời gian từ sau work log cuối cùng đến khi check-out sẽ không được tính!
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                  <p className="text-yellow-900 font-semibold mb-2">💡 Hành động yêu cầu:</p>
                  <p className="text-yellow-800 text-sm">
                    Vui lòng điền thông tin công việc bạn đã làm trong khoảng thời gian{' '}
                    <span className="font-bold">{formatHours(actualWorkHours)}</span> để được tính đầy đủ thời gian làm việc.
                  </p>
                </div>
              </div>
            </div>

            {/* Work Log Form */}
            <form onSubmit={handleAddWorkLog} className="p-6 space-y-4 bg-white">
              <h4 className="font-bold text-slate-900 text-lg mb-4 pb-2 border-b-2 border-red-200">
                📝 Điền công việc đã làm:
              </h4>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tiêu đề công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                  placeholder="Nhập tên công việc bạn đã làm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Mô tả chi tiết công việc bạn đã thực hiện..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số giờ đã làm <span className="text-slate-500 text-xs">(Mặc định: {formatHours(actualWorkHours)})</span>
                </label>
                <input
                  type="number"
                  name="hoursSpent"
                  step="0.1"
                  min="0"
                  defaultValue={actualWorkHours.toFixed(2)}
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                  defaultValue="COMPLETED"
                >
                  <option value="TODO">Chưa làm</option>
                  <option value="IN_PROGRESS">Đang làm</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="BLOCKED">Bị chặn</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowWarningModal(false);
                    localStorage.removeItem('lastCheckOutTime');
                    localStorage.removeItem('lastCheckInTime');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Bỏ qua (Rủi ro cao)
                </button>
                <button
                  type="submit"
                  disabled={workLogLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg text-lg"
                >
                  {workLogLoading ? 'Đang lưu...' : '✓ Cập nhật ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
