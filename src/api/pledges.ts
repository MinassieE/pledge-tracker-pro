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

// Response types matching backend
interface MyPledgesResponse {
  success: boolean;
  message: string;
  pledges: Pledge[];
}

interface SinglePledgeResponse {
  success: boolean;
  message: string;
  pledge: Pledge;
}

interface DuePledgesResponse {
  success: boolean;
  count: number;
  data: Pledge[];
}

export interface UpdatePledgePayload {
  alt_phone_number?: string;
  email?: string;
  material_quantity?: number;
  other_description?: string;
  payment?: {
    amount: number;
    method: string;
  };
  remark?: {
    comment: string;
  };
}

export const pledgesApi = {
  // For admin/superAdmin
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

  // For admin/superAdmin
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

  // ===== FOLLOW-UP USER ENDPOINTS =====

  // Get all pledges assigned to current follow-up user
  getMyPledges: async (): Promise<Pledge[]> => {
    const response = await api.get<MyPledgesResponse>('/myPledges');
    return response.data.pledges || [];
  },

  // Get single pledge for follow-up user
  getMyPledgeById: async (id: string): Promise<Pledge> => {
    const response = await api.get<SinglePledgeResponse>(`/myPledges/${id}`);
    return response.data.pledge;
  },

  // Update pledge (payment + remark) for follow-up user
  updateMyPledge: async (id: string, data: UpdatePledgePayload): Promise<Pledge> => {
    const response = await api.put<SinglePledgeResponse>(`/myPledges/${id}`, data);
    return response.data.pledge;
  },

  // Get due monthly pledges
  getDueMonthly: async (): Promise<Pledge[]> => {
    const response = await api.get<DuePledgesResponse>('/getDueMonthlyPledges');
    return response.data.data || [];
  },

  // Get overdue pledges
  getOverdue: async (): Promise<Pledge[]> => {
    const response = await api.get<DuePledgesResponse>('/getOverduePledges');
    return response.data.data || [];
  },
};
