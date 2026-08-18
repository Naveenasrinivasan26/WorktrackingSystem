export type UserRole = 'super_admin' | 'admin' | 'manager' | 'employee';

export type WorkStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  state?: string | null;
  employeeId?: string | null;
  mobileNumber?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface WorkAttachment {
  id: string;
  workId: string;
  fileName: string;
  fileUrl: string; // URL or base64 data
  fileSize: number; // in bytes
  fileType: string;
  uploadedAt: string;
}

export interface EditHistoryChange {
  field: string;
  oldValue: string | number | string[];
  newValue: string | number | string[];
}

export interface EditHistory {
  id: string;
  workId: string;
  editedBy: string;
  editedByName: string;
  changes: EditHistoryChange[];
  editedAt: string;
}

export interface WorkUpdate {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  department: string;
  title: string;
  description: string; // rich text HTML or structured text
  hoursSpent: number; // 0.5 to 24.0
  category: string;
  status: WorkStatus;
  reviewerId?: string | null;
  reviewerName?: string | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: WorkAttachment[];
  editHistory: EditHistory[];
}

export interface WorkStats {
  totalHoursLogged: number;
  pendingReviews: number;
  approvalRate: number; // percentage
  rejectionCount: number;
  approvedCount: number;
  activeEmployees: number;
  totalSubmissions: number;
  categoryBreakdown: { category: string; hours: number; count: number }[];
  departmentBreakdown: { department: string; hours: number; count: number }[];
  weeklyTrends: { date: string; hours: number; count: number }[];
  statusCounts: { pending: number; approved: number; rejected: number };
}

export interface WorkFilters {
  startDate?: string;
  endDate?: string;
  status?: WorkStatus | 'all';
  category?: string;
  department?: string;
  search?: string;
  sortBy?: 'created_at' | 'hours_spent' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface APIErrorResponse {
  message: string;
  errors?: string[];
}

export const QUERY_TYPES = [
  { value: 'eod_missed', label: 'Forgot to mark EOD' },
  { value: 'leave_correction', label: 'Leave correction' },
  { value: 'attendance', label: 'Attendance issue' },
  { value: 'other', label: 'Other' },
] as const;

export type QueryType = (typeof QUERY_TYPES)[number]['value'];

export type QueryStatus = 'pending' | 'in_review' | 'in_progress' | 'resolved' | 'rejected';

export interface EmployeeQuery {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  queryType: QueryType;
  subject: string;
  description: string;
  relatedDate?: string | null;
  status: QueryStatus;
  hrResponse?: string | null;
  respondedBy?: string | null;
  respondedByName?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryFilters {
  startDate?: string;
  endDate?: string;
  status?: QueryStatus | 'all';
  queryType?: QueryType | 'all';
  userId?: string;
  search?: string;
}

export interface EmployeeQueryDetail extends EmployeeQuery {
  employee: User | null;
  recentEod: EodRecord[];
  recentWorks: WorkUpdate[];
}

export type EodStatus = 'marked' | 'absent_leave';

export interface EodRecord {
  id: string;
  userId: string;
  date: string;
  status: EodStatus;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  department?: string;
  employeeId?: string | null;
}

export interface EodReportEmployee {
  userId: string;
  fullName: string;
  email: string;
  department: string;
  employeeId?: string | null;
  eodStatus: 'marked' | 'absent_leave' | 'not_marked';
  reason?: string | null;
  markedAt?: string | null;
}

export interface EodReport {
  date: string;
  marked: EodReportEmployee[];
  absentLeave: EodReportEmployee[];
  notMarked: EodReportEmployee[];
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  linkTab?: string | null;
  linkId?: string | null;
  isRead: boolean;
  createdAt: string;
}
