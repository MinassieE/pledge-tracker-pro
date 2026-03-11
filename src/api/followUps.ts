import api from './axios';
import { FollowUpUser, FollowUpsListResponse, SingleFollowUpResponse, UserStatus } from '@/types';

interface CreateFollowUpPayload {
  first_name: string;
  middle_name: string;
  email: string;
}

interface CreateFollowUpResponse {
  success: boolean;
  message: string;
  followUp?: FollowUpUser;
  password?: string; // Backend returns generated password
}

interface UpdateStatusResponse {
  success: boolean;
  message: string;
  followUp?: FollowUpUser;
}

export const followUpsApi = {
  // Get all follow-ups
  // Pass all=true to get all follow-ups without project filtering
  getAll: async (params?: { all?: boolean }): Promise<FollowUpUser[]> => {
    const queryParams = params?.all ? '?all=true' : '';
    const response = await api.get<{ success: boolean; data: FollowUpUser[] }>(`/admin/getAllFollowUps${queryParams}`);
    return response.data.data || [];
  },

  getById: async (id: string): Promise<FollowUpUser> => {
    const response = await api.get<SingleFollowUpResponse>(`/admin/getFollowUpById/${id}`);
    return response.data.followUp;
  },

  create: async (data: CreateFollowUpPayload): Promise<CreateFollowUpResponse> => {
    const response = await api.post<CreateFollowUpResponse>('/admin/addFollowUp', data);
    return response.data;
  },

  updateStatus: async (id: string, status: UserStatus): Promise<UpdateStatusResponse> => {
    const response = await api.put<UpdateStatusResponse>(`/admin/updateFollowUpStatus/${id}`, { status });
    return response.data;
  },

  // NOTE: No backend endpoint exists for deleting follow-up
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    console.warn('followUpsApi.delete: No backend endpoint available yet');
    return { success: false, message: 'Endpoint not available' };
  },
};
