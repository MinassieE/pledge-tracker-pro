import api from './axios';
import { AuthResponse, LoginCredentials, User } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    const response = await api.post<AuthResponse>('/auth/admin-login', credentials);
    
    if (response.data.success && response.data.data?.token) {
      const { token, ...userData } = response.data.data;
      
      // Transform to User object
      const user: User = {
        id: userData.id,
        first_name: userData.first_name,
        middle_name: userData.middle_name,
        email: userData.email,
        role: userData.role,
        assigned_pledges: userData.assigned_pledges,
      };
      
      return { token, user };
    }
    
    throw new Error(response.data.message || 'Login failed');
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
