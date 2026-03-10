import api from './axios';
import { Admin, ApiResponse } from '@/types';

interface CreateAdminPayload {
  first_name: string;
  middle_name: string;
  email: string;
}

interface CreateAdminResponse {
  success: boolean;
  message: string;
  admin?: Admin;
  password?: string; // Backend returns generated password
}

export const adminsApi = {
  // Get all admins (SuperAdmin only)
  getAll: async (): Promise<Admin[]> => {
    const response = await api.get<{ success: boolean; count: number; data: Admin[] }>('/admin/getAllAdmins');
    return response.data.data || [];
  },

  // NOTE: No backend endpoint exists for getting admin by ID
  getById: async (id: string): Promise<ApiResponse<Admin>> => {
    console.warn('adminsApi.getById: No backend endpoint available yet');
    return { success: false, data: {} as Admin, message: 'Endpoint not available' };
  },

  create: async (data: CreateAdminPayload): Promise<CreateAdminResponse> => {
    const response = await api.post<CreateAdminResponse>('/admin/addAdmin', data);
    return response.data;
  },

  // NOTE: No backend endpoint exists for updating admin
  update: async (id: string, data: Partial<Admin>): Promise<ApiResponse<Admin>> => {
    console.warn('adminsApi.update: No backend endpoint available yet');
    return { success: false, data: {} as Admin, message: 'Endpoint not available' };
  },

  // NOTE: No backend endpoint exists for deleting admin
  delete: async (id: string): Promise<ApiResponse<null>> => {
    console.warn('adminsApi.delete: No backend endpoint available yet');
    return { success: false, data: null, message: 'Endpoint not available' };
  },
};
