import api from './axios';
import { 
  Pledge, 
  PledgesListResponse, 
  SinglePledgeResponse, 
  PledgeStatus, 
  ContributionType,
  ApiResponse 
} from '@/types';

// Response types matching backend
interface DuePledgesResponse {
  success: boolean;
  count: number;
  data: Pledge[];
}

interface AssignPledgeResponse {
  success: boolean;
  message: string;
  pledge?: Pledge;
}

// Payload for creating a pledge
export interface CreatePledgePayload {
  full_name: string;
  phone_number: string;
  alt_phone_number?: string;
  email?: string;
  promised_amount?: number;
  contribution_type: ContributionType;
  material_type?: string;
  material_quantity?: number;
  other_description?: string;
  promised_start_date: string;
  promised_end_date?: string;
  paper_form_image?: string;
  assigned_followup?: string;
}

// Payload for updating a pledge (admin)
export interface UpdatePledgePayload {
  full_name?: string;
  phone_number?: string;
  alt_phone_number?: string;
  email?: string;
  promised_amount?: number;
  contribution_type?: ContributionType;
  material_type?: string;
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

// Payload for follow-up user updating their assigned pledge
export interface FollowUpUpdatePayload {
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
  // ===== ADMIN/SUPERADMIN ENDPOINTS =====

  // Get all pledges
  getAll: async (): Promise<Pledge[]> => {
    const response = await api.get<PledgesListResponse>('/admin/getAllPledges');
    return response.data.pledges || [];
  },

  // Get single pledge by ID
  getById: async (id: string): Promise<Pledge> => {
    const response = await api.get<SinglePledgeResponse>(`/admin/getPledgeById/${id}`);
    return response.data.pledge;
  },

  // Create new pledge
  create: async (data: CreatePledgePayload): Promise<SinglePledgeResponse> => {
    const response = await api.post<SinglePledgeResponse>('/admin/addPledge', data);
    return response.data;
  },

  // Update pledge
  update: async (id: string, data: UpdatePledgePayload): Promise<SinglePledgeResponse> => {
    const response = await api.put<SinglePledgeResponse>(`/admin/updatePledge/${id}`, data);
    return response.data;
  },

  // NOTE: No delete endpoint exists in backend
  delete: async (id: string): Promise<ApiResponse<null>> => {
    console.warn('pledgesApi.delete: No backend endpoint available yet');
    return { success: false, data: null, message: 'Endpoint not available' };
  },

  // Get unassigned pledges
  getUnassigned: async (): Promise<Pledge[]> => {
    const response = await api.get<PledgesListResponse>('/admin/getUnassignedPledges');
    return response.data.pledges || [];
  },

  // Get pledges by follow-up user
  getByFollowUp: async (followUpId: string): Promise<Pledge[]> => {
    const response = await api.get<PledgesListResponse>(`/admin/getPledgesByFollowUp/${followUpId}`);
    return response.data.pledges || [];
  },

  // Get pledges by status
  getByStatus: async (status: PledgeStatus): Promise<Pledge[]> => {
    const response = await api.get<PledgesListResponse>(`/admin/getPledgesByStatus/${status}`);
    return response.data.pledges || [];
  },

  // Get pledges by contribution type
  getByContributionType: async (type: ContributionType): Promise<Pledge[]> => {
    const response = await api.get<PledgesListResponse>(`/admin/getPledgesByContributionType/${type}`);
    return response.data.pledges || [];
  },

  // Assign single pledge to follow-up
  assignToFollowUp: async (pledgeId: string, followUpId: string): Promise<AssignPledgeResponse> => {
    const response = await api.post<AssignPledgeResponse>('/admin/assignPledgeToFollowUp', {
      pledgeId,
      followUpId,
    });
    return response.data;
  },

  // Assign multiple pledges to follow-up
  assignMultipleToFollowUp: async (pledgeIds: string[], followUpId: string): Promise<AssignPledgeResponse> => {
    const response = await api.post<AssignPledgeResponse>('/admin/assignMultiplePledgesToFollowUp', {
      pledgeIds,
      followUpId,
    });
    return response.data;
  },

  // Get due monthly pledges
  getDueMonthly: async (): Promise<Pledge[]> => {
    const response = await api.get<DuePledgesResponse>('/admin/getDueMonthlyPledges');
    return response.data.data || [];
  },

  // Get overdue pledges
  getOverdue: async (): Promise<Pledge[]> => {
    const response = await api.get<DuePledgesResponse>('/admin/getOverduePledges');
    return response.data.data || [];
  },

  // ===== FOLLOW-UP USER ENDPOINTS =====

  // Get all pledges assigned to current follow-up user
  getMyPledges: async (): Promise<Pledge[]> => {
    const response = await api.get<{ success: boolean; message: string; pledges: Pledge[] }>('/admin/myPledges');
    return response.data.pledges || [];
  },

  // Get single pledge for follow-up user
  getMyPledgeById: async (id: string): Promise<Pledge> => {
    const response = await api.get<SinglePledgeResponse>(`/admin/myPledges/${id}`);
    return response.data.pledge;
  },

  // Update pledge (payment + remark) for follow-up user
  updateMyPledge: async (id: string, data: FollowUpUpdatePayload): Promise<Pledge> => {
    const response = await api.put<SinglePledgeResponse>(`/admin/myPledges/${id}`, data);
    return response.data.pledge;
  },
};
