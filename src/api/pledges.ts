import api from './axios';
import { Pledge, ApiResponse, PaginatedResponse, PledgeStatus, PledgeType } from '@/types';

export interface PledgeFilters {
  status?: PledgeStatus;
  type?: PledgeType;
  followUpId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const pledgesApi = {
  getAll: async (filters: PledgeFilters = {}): Promise<PaginatedResponse<Pledge>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get<PaginatedResponse<Pledge>>(`/pledges?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Pledge>> => {
    const response = await api.get<ApiResponse<Pledge>>(`/pledges/${id}`);
    return response.data;
  },

  create: async (data: Partial<Pledge>): Promise<ApiResponse<Pledge>> => {
    const response = await api.post<ApiResponse<Pledge>>('/pledges', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Pledge>): Promise<ApiResponse<Pledge>> => {
    const response = await api.put<ApiResponse<Pledge>>(`/pledges/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/pledges/${id}`);
    return response.data;
  },

  getByFollowUp: async (followUpId: string): Promise<PaginatedResponse<Pledge>> => {
    const response = await api.get<PaginatedResponse<Pledge>>(`/pledges/by-follow-up/${followUpId}`);
    return response.data;
  },

  getByStatus: async (status: PledgeStatus): Promise<PaginatedResponse<Pledge>> => {
    const response = await api.get<PaginatedResponse<Pledge>>(`/pledges/by-status?status=${status}`);
    return response.data;
  },

  getByType: async (type: PledgeType): Promise<PaginatedResponse<Pledge>> => {
    const response = await api.get<PaginatedResponse<Pledge>>(`/pledges/by-type?type=${type}`);
    return response.data;
  },

  getDueMonthly: async (): Promise<PaginatedResponse<Pledge>> => {
    const response = await api.get<PaginatedResponse<Pledge>>('/pledges/due-monthly');
    return response.data;
  },

  getOverdue: async (): Promise<PaginatedResponse<Pledge>> => {
    const response = await api.get<PaginatedResponse<Pledge>>('/pledges/overdue');
    return response.data;
  },
};
