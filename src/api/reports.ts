import api from './axios';
import { 
  CollectionStats, 
  CollectionStatsResponse,
  MonthlyReportResponse,
  FollowUpPerformance,
  FollowUpPerformanceResponse
} from '@/types';

export const reportsApi = {
  // Get total collection statistics
  getCollectionStats: async (): Promise<CollectionStats> => {
    const response = await api.get<CollectionStatsResponse>('/admin/reports/totalCollectionStats');
    return response.data.data;
  },

  // Get monthly collection report for a specific month/year
  getMonthlyCollection: async (year: number, month: number): Promise<MonthlyReportResponse['data']> => {
    const response = await api.get<MonthlyReportResponse>(`/admin/reports/monthlyCollectionReport/${year}/${month}`);
    return response.data.data;
  },

  // Get follow-up performance for a specific follow-up user
  getFollowUpPerformance: async (followUpId: string): Promise<FollowUpPerformance> => {
    const response = await api.get<FollowUpPerformanceResponse>(`/admin/reports/followUpPerformance/${followUpId}`);
    return response.data.data;
  },

  // Get all follow-ups' performance
  getAllFollowUpPerformance: async (): Promise<FollowUpPerformance[]> => {
    const response = await api.get<{ success: boolean; data: FollowUpPerformance[] }>('/admin/allFollowUpPerformance');
    return response.data.data || [];
  },
};
