export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  employee?: Employee;
}

export interface Employee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  position: string;
  department: string;
  salary?: number;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  role?: 'ADMIN' | 'EMPLOYEE';
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  salary?: number;
}

export interface CreateEmployeeData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  position: string;
  department: string;
  salary?: number;
  role?: 'ADMIN' | 'EMPLOYEE';
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY' | 'WORK_FROM_HOME';

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    position: string;
    department: string;
  };
}

export interface AttendanceStatistics {
  totalDays: number;
  totalHours: number;
  presentDays: number;
  lateDays: number;
  attendanceRate: number;
}

export interface AttendanceSummary {
  today: {
    date: string;
    totalEmployees: number;
    checkedIn: number;
    checkedOut: number;
    late: number;
    attendanceRate: number;
    attendances: Attendance[];
  };
  thisMonth: {
    totalHours: number;
    averageHoursPerDay: number;
  };
  departmentStats: Record<string, {
    total: number;
    present: number;
    late: number;
  }>;
}

export type WorkLogStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface WorkLog {
  id: string;
  employeeId: string;
  date: string;
  title: string;
  description?: string;
  hoursSpent?: number;
  status: WorkLogStatus;
  createdAt: string;
  updatedAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    position: string;
    department: string;
  };
}

export interface WorkLogStatistics {
  totalLogs: number;
  totalHours: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  blockedTasks: number;
  completionRate: number;
}

export interface CreateWorkLogData {
  title: string;
  description?: string;
  hoursSpent?: number;
  status?: WorkLogStatus;
  date?: string;
}

export interface UpdateWorkLogData {
  title?: string;
  description?: string;
  hoursSpent?: number;
  status?: WorkLogStatus;
}
