import api from './axios';
import { Admin, ApiResponse, PaginatedResponse } from '@/types';

export const adminsApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Admin>> => {
    const response = await api.get<PaginatedResponse<Admin>>(`/admin?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Admin>> => {
    const response = await api.get<ApiResponse<Admin>>(`/admin/${id}`);
    return response.data;
  },

  create: async (data: Partial<Admin>): Promise<ApiResponse<Admin>> => {
    const response = await api.post<ApiResponse<Admin>>('/admin', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Admin>): Promise<ApiResponse<Admin>> => {
    const response = await api.put<ApiResponse<Admin>>(`/admin/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/admin/${id}`);
    return response.data;
  },
};
