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
