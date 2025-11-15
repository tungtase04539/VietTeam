export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  employee?: Employee;
}

export type SalaryType = 'HOURLY' | 'MONTHLY';

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
  salaryType?: SalaryType;
  hourlyRate?: number;
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
  role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
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
  role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
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
  averageHoursPerDay: number;
  attendanceRate: number;
}

export interface TodayAttendanceResponse {
  attendance: Attendance | null;
  allSessions: Attendance[];
  totalHoursToday: number;
  sessionsCount: number;
}

export interface CheckOutWarning {
  message: string;
  lastWorkLogUpdate?: string;
  timeSinceLastUpdate?: number;
  checkOutTime: string;
  actualWorkHours: number;
  declaredHours: number;
}

export interface CheckOutResponse {
  message: string;
  attendance: Attendance;
  warning?: CheckOutWarning;
}

export interface AttendanceSummary {
  today: {
    date: string;
    totalEmployees: number;
    checkedIn: number;
    currentlyWorking: number;
    checkedOut: number;
    late: number;
    attendanceRate: number;
  };
  thisMonth: {
    totalHours: number;
    averageHoursPerDay: number;
  };
  realTimeAttendance: Attendance[];
  departmentStats: Record<string, {
    totalEmployees: number;
    checkedIn: number;
    currentlyWorking: number;
    attendanceRate: number;
  }>;
}

export type WorkLogStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface WorkLog {
  id: string;
  employeeId: string;
  assignedById?: string;
  date: string;
  title: string;
  description?: string;
  hoursSpent?: number;
  status: WorkLogStatus;
  videoUrl?: string;
  videoFileId?: string;
  videoFileName?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    position: string;
    department: string;
  };
  assignedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
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
  videoUrl?: string;
  videoFileId?: string;
  videoFileName?: string;
}

export interface UpdateWorkLogData {
  title?: string;
  description?: string;
  hoursSpent?: number;
  status?: WorkLogStatus;
}

// Team Management Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    user?: {
      email: string;
      role: string;
    };
  };
  members: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
  managerId?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  managerId?: string;
}

export interface AssignWorkLogData {
  employeeIds: string | string[]; // Support single or multiple employees
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface MyTeamResponse {
  team?: Team;
  managedTeam?: Team;
}

export interface UpdateRoleData {
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}
