
import api from './axios';
import { User } from '../types';

interface AuthResponse {
  success: boolean;
  data: { token: string; user: User };
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<{ success: boolean; data: User }>('/auth/me');
    return res.data;
  },
};
