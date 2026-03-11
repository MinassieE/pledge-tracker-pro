import api from './axios';
import { ApiResponse } from '@/types';

// Project types
export type ProjectStatus = 'active' | 'inactive' | 'closed';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  start_date: string;
  status: ProjectStatus;
  total_promised_amount: number;
  total_collected_amount: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectAssignment {
  _id: string;
  user_id: string;
  project_id: string;
  assigned_at: string;
  assigned_by: string;
}

// Request payload types
export interface CreateProjectPayload {
  name: string;
  description?: string;
  start_date: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface AssignUsersPayload {
  userIds: string[];
}

// Response types
interface ProjectsListResponse {
  success: boolean;
  message?: string;
  data: Project[];
}

interface SingleProjectResponse {
  success: boolean;
  message?: string;
  data: Project;
}

interface AssignedUsersResponse {
  success: boolean;
  message?: string;
  data: any[]; // User type from assignments
}

export const projectsApi = {
  // Get all projects (role-based filtering handled by backend)
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<ProjectsListResponse>('/api/projects');
    return response.data.data || [];
  },

  // Get single project by ID
  getById: async (id: string): Promise<Project> => {
    const response = await api.get<SingleProjectResponse>(`/api/projects/${id}`);
    return response.data.data;
  },

  // Create new project (super admin only)
  create: async (data: CreateProjectPayload): Promise<Project> => {
    const response = await api.post<SingleProjectResponse>('/api/projects', data);
    return response.data.data;
  },

  // Update project (super admin only)
  update: async (id: string, data: UpdateProjectPayload): Promise<Project> => {
    const response = await api.put<SingleProjectResponse>(`/api/projects/${id}`, data);
    return response.data.data;
  },

  // Assign users to project (super admin only)
  assignUsers: async (projectId: string, userIds: string[]): Promise<void> => {
    await api.post<ApiResponse<null>>(`/api/projects/${projectId}/assignments`, { userIds });
  },

  // Remove user assignment (super admin only)
  removeUser: async (projectId: string, userId: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/api/projects/${projectId}/assignments/${userId}`);
  },

  // Get assigned users for a project
  getAssignedUsers: async (projectId: string): Promise<any[]> => {
    const response = await api.get<AssignedUsersResponse>(`/api/projects/${projectId}/assignments`);
    return response.data.data || [];
  },
};
