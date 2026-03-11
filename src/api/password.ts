import api from './axios';

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export const passwordApi = {
  forgotPassword: async (data: ForgotPasswordPayload): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/forgot-password', data);
    return response.data;
  },

  verifyOTP: async (data: VerifyOTPPayload): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/verify-otp', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/reset-password', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordPayload): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },
};
