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
  // Pass all=true to get all admins without project filtering
  getAll: async (params?: { all?: boolean }): Promise<Admin[]> => {
    const queryParams = params?.all ? '?all=true' : '';
    const response = await api.get<{ success: boolean; count: number; data: Admin[] }>(`/admin/getAllAdmins${queryParams}`);
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

  // Get user's assigned projects
  getUserProjects: async (userId: string): Promise<string[]> => {
    const response = await api.get<{ success: boolean; projectIds: string[] }>(`/projects/user/${userId}/projects`);
    return response.data.projectIds || [];
  },

  // NOTE: No backend endpoint exists for updating admin
  update: async (id: string, data: Partial<Admin>): Promise<ApiResponse<Admin>> => {
    const response = await api.put<ApiResponse<Admin>>(`/admin/updateAdmin/${id}`, data);
    return response.data;
  },
  
  // Update admin status (activate/deactivate)
  updateStatus: async (id: string, status: 'active' | 'inactive'): Promise<ApiResponse<Admin>> => {
    const response = await api.put<ApiResponse<Admin>>(`/admin/updateAdmin/${id}`, { status });
    return response.data;
  },

  // NOTE: No backend endpoint exists for deleting admin
  delete: async (id: string): Promise<ApiResponse<null>> => {
    console.warn('adminsApi.delete: No backend endpoint available yet');
    return { success: false, data: null, message: 'Endpoint not available' };
  },
};
