import api from './axios';
import { ApiResponse, CollectionStats, MonthlyCollection, FollowUpPerformance } from '@/types';

export const reportsApi = {
  getCollectionStats: async (): Promise<ApiResponse<CollectionStats>> => {
    const response = await api.get<ApiResponse<CollectionStats>>('/reports/collection-stats');
    return response.data;
  },

  getMonthlyCollection: async (): Promise<ApiResponse<MonthlyCollection[]>> => {
    const response = await api.get<ApiResponse<MonthlyCollection[]>>('/reports/monthly-collection');
    return response.data;
  },

  getFollowUpPerformance: async (): Promise<ApiResponse<FollowUpPerformance[]>> => {
    const response = await api.get<ApiResponse<FollowUpPerformance[]>>('/reports/follow-up-performance');
    return response.data;
  },
};
