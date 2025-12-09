export type UserRole = 'superAdmin' | 'admin' | 'followUp';

export interface User {
  id?: string;
  _id?: string;
  first_name?: string;
  middle_name?: string;
  name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  assigned_pledges?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface FollowUpUser extends User {
  role: 'followUp';
  assignedAdmin?: string;
}

export type PledgeType = 'cash' | 'material';
export type PledgeStatus = 'pending' | 'paid' | 'partial' | 'overdue';

export interface Payment {
  _id: string;
  amount: number;
  currency: 'ETB' | 'USD';
  paidAt: string;
  notes?: string;
}

export interface Pledge {
  _id: string;
  fullName: string;
  phone: string;
  address?: string;
  pledgeType: PledgeType;
  amount?: number;
  currency?: 'ETB' | 'USD';
  materialType?: string;
  promisedDate: string;
  status: PledgeStatus;
  assignedFollowUp?: string | FollowUpUser;
  notes?: string;
  payments: Payment[];
  totalPaid: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CollectionStats {
  totalPledges: number;
  totalCollectedETB: number;
  totalCollectedUSD: number;
  remainingBalanceETB: number;
  remainingBalanceUSD: number;
  paidCount: number;
  pendingCount: number;
  partialCount: number;
  overdueCount: number;
}

export interface MonthlyCollection {
  month: string;
  year: number;
  totalETB: number;
  totalUSD: number;
  pledgeCount: number;
}

export interface FollowUpPerformance {
  followUpId: string;
  name: string;
  completedPledges: number;
  totalCollected: number;
  overdueHandled: number;
  successRate: number;
}

export interface DashboardStats {
  totalAdmins?: number;
  totalFollowUps?: number;
  totalPledges: number;
  totalCollectedETB: number;
  totalCollectedUSD: number;
  pendingCount: number;
  overdueCount: number;
  completedCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUserData {
  id: string;
  first_name: string;
  middle_name?: string;
  email: string;
  role: UserRole;
  assigned_pledges: string[];
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthUserData;
}

export interface DecodedToken {
  userId: string;
  role: UserRole;
  exp: number;
  iat: number;
}
