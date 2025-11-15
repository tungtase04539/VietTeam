import axios from 'axios';
import {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
  Employee,
  CreateEmployeeData,
  Attendance,
  AttendanceStatistics,
  AttendanceSummary,
  WorkLog,
  WorkLogStatistics,
  CreateWorkLogData,
  UpdateWorkLogData,
  Team,
  CreateTeamData,
  UpdateTeamData,
  AssignWorkLogData,
  MyTeamResponse,
  UpdateRoleData,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  getProfile: () => api.get<User>('/auth/profile'),
};

// Employee API
export const employeeAPI = {
  create: (data: CreateEmployeeData) =>
    api.post<{ message: string; employee: Employee }>('/employees', data),
  getAll: () => api.get<Employee[]>('/employees'),
  getById: (id: string) => api.get<Employee>(`/employees/${id}`),
  update: (id: string, data: Partial<Employee>) =>
    api.put<{ message: string; employee: Employee }>(`/employees/${id}`, data),
  updateRole: (id: string, data: UpdateRoleData) =>
    api.patch<{ message: string; user: User }>(`/employees/${id}/role`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/employees/${id}`),
  resetAll: () => api.post<{ message: string }>('/employees/reset-all'),
  createDemo: () => api.post<{ 
    message: string; 
    employees: any[];
    credentials: { password: string; accounts: string[] };
  }>('/employees/create-demo'),
};

// Attendance API
export const attendanceAPI = {
  checkIn: (notes?: string) =>
    api.post<{ message: string; attendance: Attendance }>('/attendance/check-in', { notes }),
  checkOut: (notes?: string, forceCheckout?: boolean) =>
    api.post<{ message: string; attendance: Attendance }>('/attendance/check-out', { notes, forceCheckout }),
  getToday: () => api.get<{ attendance: Attendance | null }>('/attendance/today'),
  getMyRecords: (params?: { startDate?: string; endDate?: string; limit?: number }) =>
    api.get<{ attendances: Attendance[]; statistics: AttendanceStatistics }>(
      '/attendance/my-records',
      { params }
    ),
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    status?: string;
  }) => api.get<{ attendances: Attendance[] }>('/attendance/all', { params }),
  getSummary: () => api.get<AttendanceSummary>('/attendance/summary'),
};

// Work Log API
export const workLogAPI = {
  create: (data: CreateWorkLogData) =>
    api.post<{ message: string; workLog: WorkLog }>('/work-logs', data),
  getMyLogs: (params?: { startDate?: string; endDate?: string; status?: string; limit?: number }) =>
    api.get<{ workLogs: WorkLog[]; statistics: WorkLogStatistics }>('/work-logs/my-logs', {
      params,
    }),
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    status?: string;
    limit?: number;
  }) => api.get<{ workLogs: WorkLog[] }>('/work-logs/all', { params }),
  update: (id: string, data: UpdateWorkLogData) =>
    api.put<{ message: string; workLog: WorkLog }>(`/work-logs/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/work-logs/${id}`),
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get<{
      overall: {
        totalLogs: number;
        totalHours: number;
        completedTasks: number;
        completionRate: number;
      };
      employeeStats: Record<string, any>;
      departmentStats: Record<string, any>;
    }>('/work-logs/stats', { params }),
};

// Team API
export const teamAPI = {
  create: (data: CreateTeamData) =>
    api.post<{ message: string; team: Team }>('/teams', data),
  getAll: () => api.get<{ teams: Team[] }>('/teams/all'),
  getMyTeam: () => api.get<MyTeamResponse>('/teams/my-team'),
  update: (id: string, data: UpdateTeamData) =>
    api.put<{ message: string; team: Team }>(`/teams/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/teams/${id}`),
  addMember: (teamId: string, employeeId: string) =>
    api.post<{ message: string; employee: Employee }>(`/teams/${teamId}/members`, {
      employeeId,
    }),
  removeMember: (employeeId: string) =>
    api.delete<{ message: string; employee: Employee }>(`/teams/members/${employeeId}`),
  assignWork: (data: AssignWorkLogData) =>
    api.post<{ 
      message: string; 
      workLogs: WorkLog[];
      summary: {
        totalWorkLogs: number;
        employeeCount: number;
        dayCount: number;
        dateRange: {
          start: string;
          end: string;
        };
      };
    }>('/teams/assign-work', data),
  getAttendanceSummary: () => api.get<any>('/teams/attendance-summary'),
  getWorkLogStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get<any>('/teams/worklog-stats', { params }),
};

export default api;
