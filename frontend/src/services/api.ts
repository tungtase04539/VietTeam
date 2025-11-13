import axios from 'axios';
import { AuthResponse, LoginData, RegisterData, User, Employee } from '../types';

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
  getAll: () => api.get<Employee[]>('/employees'),
  getById: (id: string) => api.get<Employee>(`/employees/${id}`),
  update: (id: string, data: Partial<Employee>) =>
    api.put<{ message: string; employee: Employee }>(`/employees/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/employees/${id}`),
};

export default api;
