import api from './axios';
import { FollowUpUser, ApiResponse, PaginatedResponse } from '@/types';

export const followUpsApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<FollowUpUser>> => {
    const response = await api.get<PaginatedResponse<FollowUpUser>>(`/follow-up?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<FollowUpUser>> => {
    const response = await api.get<ApiResponse<FollowUpUser>>(`/follow-up/${id}`);
    return response.data;
  },

  create: async (data: Partial<FollowUpUser>): Promise<ApiResponse<FollowUpUser>> => {
    const response = await api.post<ApiResponse<FollowUpUser>>('/follow-up', data);
    return response.data;
  },

  update: async (id: string, data: Partial<FollowUpUser>): Promise<ApiResponse<FollowUpUser>> => {
    const response = await api.put<ApiResponse<FollowUpUser>>(`/follow-up/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/follow-up/${id}`);
    return response.data;
  },
};
