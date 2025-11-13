import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeAPI, attendanceAPI, workLogAPI } from '../services/api';
import {
  Employee,
  CreateEmployeeData,
  Attendance,
  WorkLog,
  AttendanceSummary,
} from '../types';

type TabType = 'employees' | 'attendance' | 'worklogs';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('employees');

  // Employee state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState<CreateEmployeeData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    position: '',
    department: '',
    salary: undefined,
    role: 'EMPLOYEE',
  });

  // Attendance state
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    employeeId: '',
  });

  // Work logs state
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [workLogFilters, setWorkLogFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    employeeId: '',
  });
  const [workLogStats, setWorkLogStats] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceSummary();
    fetchAttendances();
    fetchWorkLogs();
    fetchWorkLogStats();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const response = await attendanceAPI.getSummary();
      setAttendanceSummary(response.data);
    } catch (err: any) {
      console.error('Error loading attendance summary:', err);
    }
  };

  const fetchAttendances = async () => {
    try {
      const response = await attendanceAPI.getAll(attendanceFilters);
      setAttendances(response.data.attendances);
    } catch (err: any) {
      console.error('Error loading attendances:', err);
    }
  };

  const fetchWorkLogs = async () => {
    try {
      const response = await workLogAPI.getAll(workLogFilters);
      setWorkLogs(response.data.workLogs);
    } catch (err: any) {
      console.error('Error loading work logs:', err);
    }
  };

  const fetchWorkLogStats = async () => {
    try {
      const response = await workLogAPI.getStats();
      setWorkLogStats(response.data);
    } catch (err: any) {
      console.error('Error loading work log stats:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendances();
    } else if (activeTab === 'worklogs') {
      fetchWorkLogs();
    }
  }, [attendanceFilters, workLogFilters, activeTab]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await employeeAPI.create(newEmployee);
      setEmployees([response.data.employee, ...employees]);
      setShowAddModal(false);
      setNewEmployee({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        position: '',
        department: '',
        salary: undefined,
        role: 'EMPLOYEE',
      });
      alert('Thêm nhân viên thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể thêm nhân viên');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      return;
    }

    try {
      await employeeAPI.delete(id);
      setEmployees(employees.filter((emp) => emp.id !== id));
      alert('Xóa nhân viên thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa nhân viên');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      const response = await employeeAPI.update(editingEmployee.id, {
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        phone: editingEmployee.phone,
        address: editingEmployee.address,
        position: editingEmployee.position,
        department: editingEmployee.department,
        salary: editingEmployee.salary,
      });

      setEmployees(
        employees.map((emp) =>
          emp.id === editingEmployee.id ? response.data.employee : emp
        )
      );
      setShowEditModal(false);
      setEditingEmployee(null);
      alert('Cập nhật nhân viên thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật nhân viên');
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatHours = (hours?: number) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
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

  // Quick date filter helpers
  const setQuickDateFilter = (period: 'today' | 'yesterday' | 'last7days' | 'last30days') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(today);
        endDate.setDate(today.getDate() - 1);
        break;
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        endDate = today;
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        endDate = today;
        break;
    }

    setAttendanceFilters({
      ...attendanceFilters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  // Group attendances by date and calculate daily totals
  const getDailySummary = () => {
    const dailyMap = new Map<string, { date: string; totalHours: number; employeeCount: number }>();

    attendances.forEach((att) => {
      const dateKey = att.date.split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey, totalHours: 0, employeeCount: 0 });
      }
      const entry = dailyMap.get(dateKey)!;
      if (att.totalHours) {
        entry.totalHours += att.totalHours;
        entry.employeeCount += 1;
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-light text-slate-900">
                Dashboard <span className="font-medium text-indigo-600">Admin</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Quản lý nhân viên, chấm công & công việc
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">
                  {user?.employee?.firstName} {user?.employee?.lastName}
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
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-500">Đang tải...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Tổng nhân viên</p>
                    <p className="text-3xl font-light text-slate-900">{employees.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Đang làm việc</p>
                    <p className="text-3xl font-light text-slate-900">
                      {attendanceSummary?.today.checkedIn || 0}/
                      {attendanceSummary?.today.totalEmployees || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
                    <p className="text-sm text-slate-500 mb-1">Giờ TB/ngày</p>
                    <p className="text-3xl font-light text-slate-900">
                      {attendanceSummary?.thisMonth.averageHoursPerDay
                        ? formatHours(attendanceSummary.thisMonth.averageHoursPerDay)
                        : '0h'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Tỷ lệ chấm công</p>
                    <p className="text-3xl font-light text-slate-900">
                      {attendanceSummary?.today.attendanceRate
                        ? `${Math.round(attendanceSummary.today.attendanceRate)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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

            {/* Tabs */}
            <div className="mb-6 border-b border-slate-200">
              <nav className="-mb-px flex gap-8">
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'employees'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Nhân viên
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'attendance'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Chấm công
                </button>
                <button
                  onClick={() => setActiveTab('worklogs')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'worklogs'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Công việc
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'employees' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200/50 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium text-slate-900">Danh sách nhân viên</h2>
                    <p className="text-sm text-slate-500 mt-1">{employees.length} nhân viên</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                           transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    + Thêm nhân viên
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200/50">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Họ tên
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Chức vụ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Phòng ban
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Lương
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-slate-200/50">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600">{employee.user?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600">{employee.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600">{employee.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 font-medium">
                              {formatCurrency(employee.salary)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${
                                employee.user?.role === 'ADMIN'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {employee.user?.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-6">
                {/* Real-time Attendance */}
                {attendanceSummary?.realTimeAttendance &&
                  attendanceSummary.realTimeAttendance.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-slate-200/50">
                        <h2 className="text-lg font-medium text-slate-900">
                          Đang làm việc (Real-time)
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          {attendanceSummary.realTimeAttendance.length} nhân viên đang online
                        </p>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {attendanceSummary.realTimeAttendance.map((att) => (
                          <div
                            key={att.id}
                            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {att.employee?.firstName} {att.employee?.lastName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {att.employee?.department} - {att.employee?.position}
                                </p>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-600">
                                Check-in: {formatTime(att.checkInTime)}
                              </p>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  att.status
                                )}`}
                              >
                                {getStatusText(att.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Attendance Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Lọc bản ghi</h3>

                  {/* Quick Date Filters */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setQuickDateFilter('today')}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                    >
                      Hôm nay
                    </button>
                    <button
                      onClick={() => setQuickDateFilter('yesterday')}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                    >
                      Hôm qua
                    </button>
                    <button
                      onClick={() => setQuickDateFilter('last7days')}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                    >
                      7 ngày qua
                    </button>
                    <button
                      onClick={() => setQuickDateFilter('last30days')}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                    >
                      30 ngày qua
                    </button>
                  </div>

                  {/* Advanced Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="date"
                      value={attendanceFilters.startDate}
                      onChange={(e) =>
                        setAttendanceFilters({ ...attendanceFilters, startDate: e.target.value })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Từ ngày"
                    />
                    <input
                      type="date"
                      value={attendanceFilters.endDate}
                      onChange={(e) =>
                        setAttendanceFilters({ ...attendanceFilters, endDate: e.target.value })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Đến ngày"
                    />
                    <select
                      value={attendanceFilters.status}
                      onChange={(e) =>
                        setAttendanceFilters({ ...attendanceFilters, status: e.target.value })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="PRESENT">Đúng giờ</option>
                      <option value="LATE">Đi muộn</option>
                      <option value="ABSENT">Vắng</option>
                      <option value="WORK_FROM_HOME">Làm từ xa</option>
                    </select>
                    <select
                      value={attendanceFilters.employeeId}
                      onChange={(e) =>
                        setAttendanceFilters({ ...attendanceFilters, employeeId: e.target.value })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Tất cả nhân viên</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Daily Summary */}
                {attendances.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm p-6">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Tổng giờ làm theo ngày</h3>
                    <div className="space-y-3">
                      {getDailySummary().map((day) => (
                        <div
                          key={day.date}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {new Date(day.date).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-slate-500">{day.employeeCount} nhân viên</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-600">{formatHours(day.totalHours)}</p>
                            <p className="text-sm text-slate-500">Tổng giờ làm</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendance Records */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-200/50">
                    <h2 className="text-lg font-medium text-slate-900">Bản ghi chấm công</h2>
                    <p className="text-sm text-slate-500 mt-1">{attendances.length} bản ghi</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200/50">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                            Nhân viên
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                            Ngày
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                            Check-in
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                            Check-out
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                            Tổng giờ
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 divide-y divide-slate-200/50">
                        {attendances.map((att) => (
                          <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">
                                {att.employee?.firstName} {att.employee?.lastName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {att.employee?.department}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {formatDate(att.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {formatTime(att.checkInTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {formatTime(att.checkOutTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {formatHours(att.totalHours)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  att.status
                                )}`}
                              >
                                {getStatusText(att.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'worklogs' && (
              <div className="space-y-6">
                {/* Work Log Stats */}
                {workLogStats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Tổng công việc</p>
                      <p className="text-3xl font-light text-slate-900">
                        {workLogStats.overall?.totalLogs || 0}
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Tổng giờ làm</p>
                      <p className="text-3xl font-light text-slate-900">
                        {formatHours(workLogStats.overall?.totalHours)}
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Tỷ lệ hoàn thành</p>
                      <p className="text-3xl font-light text-slate-900">
                        {workLogStats.overall?.completionRate
                          ? `${Math.round(workLogStats.overall.completionRate)}%`
                          : '0%'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Work Log Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Lọc công việc</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="date"
                      value={workLogFilters.startDate}
                      onChange={(e) =>
                        setWorkLogFilters({ ...workLogFilters, startDate: e.target.value })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="date"
                      value={workLogFilters.endDate}
                      onChange={(e) =>
                        setWorkLogFilters({ ...workLogFilters, endDate: e.target.value })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={workLogFilters.status}
                      onChange={(e) =>
                        setWorkLogFilters({ ...workLogFilters, status: e.target.value })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="TODO">Chưa làm</option>
                      <option value="IN_PROGRESS">Đang làm</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="BLOCKED">Bị chặn</option>
                    </select>
                    <select
                      value={workLogFilters.employeeId}
                      onChange={(e) =>
                        setWorkLogFilters({ ...workLogFilters, employeeId: e.target.value })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Tất cả nhân viên</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Work Logs List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-200/50">
                    <h2 className="text-lg font-medium text-slate-900">Danh sách công việc</h2>
                    <p className="text-sm text-slate-500 mt-1">{workLogs.length} công việc</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {workLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 mb-1">{log.title}</h3>
                            {log.description && (
                              <p className="text-sm text-slate-600 mb-2">{log.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>
                                {log.employee?.firstName} {log.employee?.lastName}
                              </span>
                              <span>•</span>
                              <span>{log.employee?.department}</span>
                              <span>•</span>
                              <span>{formatDate(log.date)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {getStatusText(log.status)}
                            </span>
                            {log.hoursSpent && (
                              <span className="text-sm text-slate-600">
                                {formatHours(log.hoursSpent)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-200/50 rounded-t-2xl">
              <h3 className="text-xl font-medium text-slate-900">Thêm nhân viên mới</h3>
              <p className="text-sm text-slate-500 mt-1">
                Điền thông tin nhân viên mới vào form bên dưới
              </p>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.firstName}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Nguyễn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Văn A"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Chức vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phòng ban <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="IT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lương</label>
                  <input
                    type="number"
                    value={newEmployee.salary || ''}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        salary: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="10000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0123456789"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ</label>
                  <input
                    type="text"
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="123 Đường ABC, Quận XYZ"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Thêm nhân viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-200/50 rounded-t-2xl">
              <h3 className="text-xl font-medium text-slate-900">Chỉnh sửa nhân viên</h3>
              <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin nhân viên</p>
            </div>

            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Họ</label>
                  <input
                    type="text"
                    value={editingEmployee.firstName}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tên</label>
                  <input
                    type="text"
                    value={editingEmployee.lastName}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Chức vụ</label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, position: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phòng ban</label>
                  <input
                    type="text"
                    value={editingEmployee.department}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, department: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lương</label>
                  <input
                    type="number"
                    value={editingEmployee.salary || ''}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        salary: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.phone || ''}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ</label>
                  <input
                    type="text"
                    value={editingEmployee.address || ''}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmployee(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
