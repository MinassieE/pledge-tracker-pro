import api from './axios';
import { AuthResponse, LoginCredentials } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
};
