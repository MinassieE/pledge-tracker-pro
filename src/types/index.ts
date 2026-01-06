export type UserRole = 'superAdmin' | 'admin' | 'followUp';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id?: string;
  _id?: string;
  first_name?: string;
  middle_name?: string;
  name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status?: UserStatus;
  assigned_pledges?: string[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface FollowUpUser extends User {
  role: 'followUp';
  assignedAdmin?: string;
  assigned_admin?: string;
}

export type ContributionType = 'oneTime' | 'monthly' | 'material';
export type PledgeType = 'cash' | 'material';
export type PledgeStatus = 'pending' | 'paid' | 'partial' | 'overdue';

export interface Payment {
  _id?: string;
  amount: number;
  currency?: 'ETB' | 'USD';
  paidAt?: string;
  paid_at?: string;
  method?: string;
  notes?: string;
}

export interface Remark {
  _id?: string;
  comment: string;
  createdAt?: string;
  created_at?: string;
}

export interface Pledge {
  _id: string;
  // Support both camelCase and snake_case from backend
  fullName?: string;
  full_name?: string;
  phone?: string;
  phone_number?: string;
  alt_phone_number?: string;
  email?: string;
  address?: string;
  pledgeType?: PledgeType;
  pledge_type?: PledgeType;
  contributionType?: ContributionType;
  contribution_type?: ContributionType;
  amount?: number;
  promised_amount?: number;
  currency?: 'ETB' | 'USD';
  materialType?: string;
  material_type?: string;
  material_quantity?: number;
  other_description?: string;
  promisedDate?: string;
  promised_date?: string;
  promised_start_date?: string;
  promised_end_date?: string;
  paper_form_image?: string;
  status?: PledgeStatus;
  assignedFollowUp?: string | FollowUpUser;
  assigned_follow_up?: string | FollowUpUser;
  assigned_followup?: string | FollowUpUser;
  notes?: string;
  payments?: Payment[];
  remarks?: Remark[];
  totalPaid?: number;
  total_paid?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CollectionStats {
  totalPledges: number;
  totalPromisedETB?: number;
  totalPromisedUSD?: number;
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
  first_name?: string;
  middle_name?: string;
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

// Generic API Response wrappers
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

// Backend-specific response types
export interface PledgesListResponse {
  success: boolean;
  message: string;
  pledges: Pledge[];
  count?: number;
}

export interface SinglePledgeResponse {
  success: boolean;
  message: string;
  pledge: Pledge;
}

export interface FollowUpsListResponse {
  success: boolean;
  message: string;
  followUps: FollowUpUser[];
}

export interface SingleFollowUpResponse {
  success: boolean;
  message: string;
  followUp: FollowUpUser;
}

export interface CollectionStatsResponse {
  success: boolean;
  message?: string;
  data: CollectionStats;
}

export interface MonthlyReportResponse {
  success: boolean;
  message?: string;
  data: {
    month: number;
    year: number;
    totalCollected: number;
    pledgesCollected: number;
    payments: Payment[];
  };
}

export interface FollowUpPerformanceResponse {
  success: boolean;
  message?: string;
  data: FollowUpPerformance;
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
  id?: string;
  role: UserRole;
  exp: number;
  iat: number;
}
