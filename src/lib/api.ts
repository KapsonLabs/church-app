// API configuration and service functions
// const API_BASE_URL = 'http://localhost:8000/api/';
const API_BASE_URL = 'https://api.resolver.iolabz.ug/api/'
// export const MEDIA_URL = 'http://localhost:8000';

// Custom error class to preserve backend error structure
export class ApiError extends Error {
  public readonly status: number;
  public readonly error: string;
  public readonly violations?: string[];
  public readonly warnings?: string[];
  public readonly details?: any;

  constructor(
    message: string,
    status: number,
    error: string,
    violations?: string[],
    warnings?: string[],
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.error = error;
    this.violations = violations;
    this.warnings = warnings;
    this.details = details;
  }
}

// Types for authentication
export interface Branch {
  id: string;
  organization_id: string;
  name: string;
  code: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role?: AuthUserRole;
  permissions?: string[] | UserPermissionModule[];
  branch?: Branch;
}

export interface AuthUserRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  role_type: string;
  permissions_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: AuthUser & {
    role: AuthUserRole;
    permissions: string[];
    branch: Branch;
  };
  websocket_endpoints?: {
    notifications: string;
    messages: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}


// Types for User Roles
export interface UserRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  role_type: string;
  organization: {
    id: string;
    name: string;
  };
  permissions_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface UserRolesResponse {
  data: UserRole[];
  status: number;
}

export interface RoleInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  role_type: string;
  branch_id: number;
  branch_name: string;
  is_active: boolean;
  users_count: number;
}

export interface RolePermissionsData {
  role_info: RoleInfo;
  permissions_by_module: UserPermissionModule[];
  total_permissions: number;
  total_modules: number;
}

export interface RolePermissionsResponse {
  data: RolePermissionsData;
  status: number;
}

// Types for Permissions
export interface Permission {
  id: number;
  name: string;
  codename: string;
  description: string;
  action: string;
  action_display: string;
  is_active: boolean;
  created_at: string;
}

export interface PermissionModule {
  module_id: number;
  module_name: string;
  module_description: string;
  module_is_active: boolean;
  permissions: Permission[];
  permissions_count: number;
}

export interface AllPermissionsResponse {
  data: PermissionModule[];
  total_modules: number;
  total_permissions: number;
  status: number;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  role_type: 'custom' | 'system';
  permission_ids: number[];
  is_active: boolean;
  organization_id: string;
}

export interface CreateRoleResponse {
  data: UserRole;
  status: number;
  message: string;
}

export interface AddPermissionsModule {
  module_id: number;
  permissions: number[];
}

export interface AddPermissionsRequest {
  modules: AddPermissionsModule[];
}

export interface AddPermissionsResponse {
  status: number;
  message: string;
}

export interface RemovePermissionsRequest {
  permission_ids: number[];
}

export interface RemovePermissionsResponse {
  status: number;
  message: string;
}

// Types for Branch Users
export interface UserPermission {
  id: number;
  name: string;
  codename: string;
  action: string;
  action_display: string;
}

export interface UserPermissionModule {
  module_id: number;
  module_name: string;
  module_description: string;
  permissions: UserPermission[];
  permissions_count: number;
}

export interface BranchUser {
  id: number;
  user: string;
  user_email: string;
  user_name: string;
  branch: number;
  branch_name: string;
  role: string;
  role_name: string;
  role_slug: string;
  is_active: boolean;
  is_primary_branch: boolean;
  permissions: UserPermissionModule[];
  assigned_by: string;
  assigned_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface BranchUsersResponse {
  data: BranchUser[];
  status: number;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  is_primary_branch: boolean;
}

export interface CreateUserResponse {
  data: BranchUser;
  status: number;
  message: string;
}

export interface ChangePasswordRequest {
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  message: string;
  user_id: string;
  user_email: string;
  status: number;
}

export interface UserProfileResponse {
  data: BranchUser;
  status: number;
}

// Types for Organization Users
export interface OrganizationUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  date_of_birth: string | null;
  role: AuthUserRole;
  permissions: string[];
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationUsersResponse {
  status: number;
  data: OrganizationUser[];
}

export interface CurrentUserProfileResponse {
  status: number;
  data: OrganizationUser;
}

export interface DailyExchangeRate {
  id: number;
  branch_currency: number;
  branch_currency_display: string;
  currency_code: string;
  date: string;
  is_base_currency: boolean;
  rate_to_base_buying: string;
  rate_from_base_selling: string;
  rate_source: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

export interface DailyExchangeRatesResponse {
  date: string;
  rates_count: number;
  rates: DailyExchangeRate[];
}

export interface ExchangeRatesStatusResponse {
  status: number; // 1 for success, 0 for failure
}

// Types for CRM Tickets API
export interface TicketUser {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  created_by: TicketUser;
  assigned_to: TicketUser[];
  branch: number;
  created_at: string;
  updated_at: string;
  comment_count: number;
}

export interface TicketsResponse {
  data: Ticket[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  assigned_to_ids: string[];
  branch: string;
  metadata?: Record<string, any>;
}

export interface CreateTicketResponse {
  data: Ticket & {
    description: string;
    resolved_at: string | null;
    closed_at: string | null;
    closed_by: any | null;
    metadata: Record<string, any>;
    comments: any[];
    attachments: any[];
  };
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  assigned_to_ids: string[];
  attachments?: File[];
}

export interface UpdateTicketResponse {
  data: Ticket & {
    description: string;
    resolved_at: string | null;
    closed_at: string | null;
    closed_by: any | null;
    metadata: Record<string, any>;
    comments: any[];
    attachments: any[];
  };
}

export interface TicketComment {
  id: number;
  ticket: number;
  user: TicketUser;
  comment: string;
  is_internal: boolean;
  attachments: any[];
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface TicketDetails {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_by: TicketUser;
  assigned_to: TicketUser[];
  branch: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  closed_by: any | null;
  metadata: Record<string, any>;
  comments: TicketComment[];
  attachments: any[];
  comment_count: number;
}

export interface TicketDetailsResponse {
  data: TicketDetails;
}

export interface CreateCommentRequest {
  ticket: number;
  comment: string;
}

export interface CreateCommentResponse {
  data: TicketComment;
}

export interface CloseTicketRequest {
  closing_comment: string;
}

export interface CloseTicketResponse {
  data: {
    id: number;
    status: string;
  };
}

// Types for Notifications API
export interface NotificationUser {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

export interface NotificationMetadata {
  branch_id?: number;
  member_id?: string;
  created_by?: string;
  branch_name?: string;
  member_name?: string;
  [key: string]: any;
}

export interface Notification {
  id: number;
  user: NotificationUser;
  notification_type: string;
  title: string;
  message: string;
  related_ticket: number | null;
  related_message: number | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  metadata: NotificationMetadata;
}

export interface NotificationsResponse {
  data: Notification[];
}

export interface UnreadCountResponse {
  unread_count: number;
}


// Types for KPIs API
export interface KPIOrganization {
  id: string;
  name: string;
}

export interface KPIBranch {
  id: string;
  name: string;
}

export interface KPICreatedBy {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  organization: KPIOrganization;
  branch: KPIBranch;
  source_type: 'manual' | 'aggregate';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  aggregate_query: string;
  unit: string;
  target_value: string;
  minimum_value: string;
  maximum_value: string;
  is_active: boolean;
  created_by: KPICreatedBy;
  entries_count: number;
  created_at: string;
  updated_at: string;
}

export interface KPIsResponse {
  status: number;
  data: KPI[];
}

export interface CreateKPIRequest {
  name: string;
  description: string;
  organization_id: string;
  branch_id: string;
  source_type: 'manual' | 'aggregate';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  aggregate_query: string;
  unit: string;
  target_value: number;
  minimum_value: number;
  maximum_value: number;
}

export interface CreateKPIResponse {
  status: number;
  data: KPI;
}

export interface KPIDetailsResponse {
  status: number;
  data: KPI;
}

export interface KPITrend {
  period_start: string;
  period_end: string;
  period_label: string;
  value: number;
  percentage_change: number | null;
  is_increase: boolean | null;
  is_calculated: boolean;
  created_at: string;
}

export interface KPIStatistics {
  total_periods: number;
  current_value: number;
  first_value: number;
  average_value: number;
  min_value: number;
  max_value: number;
  overall_change_percentage: number | null;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

export interface KPITrendsResponse {
  status: number;
  data: {
    kpi: {
      id: string;
      name: string;
      period: string;
      unit: string;
      target_value: number;
    };
    statistics: KPIStatistics;
    trends: KPITrend[];
  };
}

// Types for KPI Approvals
export interface KPIApprovalUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface KPIApproval {
  id: string;
  kpi: {
    id: string;
    name: string;
  };
  assignment: {
    id: string;
  };
  period_start: string;
  period_end: string;
  reported_value: string;
  notes: string;
  supporting_documentation: string | object;
  status: 'submitted' | 'approved' | 'rejected';
  reported_by: KPIApprovalUser;
  approved_by: KPIApprovalUser | null;
  approval_notes: string;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KPIApprovalsResponse {
  status: number;
  data: KPIApproval[];
  count: number;
  filter_status: string;
}

export interface ApproveKPIRequest {
  action: 'approve' | 'reject';
  notes: string;
}

export interface ApproveKPIResponse {
  status: number;
  data: KPIApproval;
}

// Types for My KPIs Portfolio
export interface MyKPIAssignment {
  id: string;
  kpi: {
    id: string;
    name: string;
  };
  assignment_type: 'role' | 'user';
  role: {
    id: string;
    name: string;
    slug: string;
  } | null;
  user: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  is_active: boolean;
  assigned_by: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MyKPIPortfolioItem {
  kpi: KPI & {
    organization: {
      id: string;
      name: string;
    };
    branch: {
      id: string;
      name: string;
    };
  };
  assignment: MyKPIAssignment;
  latest_value: number | null;
  latest_period_start: string | null;
  latest_period_end: string | null;
  current_period_value: number | null;
  current_period_start: string;
  current_period_end: string;
  target_value: number;
  average_value: number;
  total_entries: number;
  achievement_percentage: number;
  is_on_track: boolean;
  pending_reports_count: number;
}

export interface MyKPIPortfolioResponse {
  status: number;
  data: {
    kpis: MyKPIPortfolioItem[];
    total_kpis: number;
    average_performance: number;
  };
}

// Types for KPI Reports
export interface KPIReport {
  id: string;
  kpi: {
    id: string;
    name: string;
  };
  assignment: {
    id: string;
  };
  period_start: string;
  period_end: string;
  reported_value: string;
  notes: string;
  supporting_documentation: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  reported_by: KPIApprovalUser;
  approved_by: KPIApprovalUser | null;
  approval_notes: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KPIReportsResponse {
  status: number;
  data: KPIReport[];
}

export interface CreateKPIReportRequest {
  assignment_id: string;
  period_start: string;
  period_end: string;
  reported_value: number;
  notes: string;
  supporting_documentation?: string;
}

export interface CreateKPIReportResponse {
  status: number;
  data: KPIReport;
}

// API service class
class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');
  }

  getBaseUrl(): string {
    return this.baseURL;
  }

  getBaseOrigin(): string {
    try {
      if (this.baseURL.startsWith('http')) {
        const parsed = new URL(this.baseURL);
        return parsed.origin;
      }

      if (typeof window !== 'undefined') {
        const parsed = new URL(this.baseURL, window.location.origin);
        return parsed.origin;
      }
    } catch (error) {
      console.error('Failed to resolve API base origin:', error);
    }

    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return this.baseURL;
  }

  // Set access token
  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  // Get access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Set unauthorized callback
  setOnUnauthorized(callback: (() => void) | null) {
    this.onUnauthorized = callback;
  }

  // Make authenticated request
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit & { Authorization?: string } = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Bearer token if available
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        // Clear the token immediately
        this.setAccessToken(null);
        
        // Trigger logout callback if set
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      
      // Create structured error with backend error details
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.error || 'Request failed',
        errorData.violations,
        errorData.warnings,
        errorData.details || errorData
      );
    }

    return response.json();
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const loginEndpoint = 'accounts/auth/login/';
    const url = `${this.baseURL}${loginEndpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.error || 'Request failed',
        errorData.violations,
        errorData.warnings,
        errorData.details || errorData
      );
    }

    const data = await response.json();

    if (data.access) {
      this.setAccessToken(data.access);
    }

    // Extract sessionid from document.cookie
    // Note: Set-Cookie headers are not accessible via JavaScript for security reasons
    // The browser automatically sets cookies, so we read from document.cookie
    if (typeof document !== 'undefined' && document.cookie) {
      const cookieMatch = document.cookie.match(/sessionid=([^;]+)/);
      if (cookieMatch) {
        const sessionId = cookieMatch[1];
        localStorage.setItem('sessionid', sessionId);
        console.log('Session ID extracted and stored');
      } else {
        console.warn('Session ID not found in cookies');
      }
    }

    return data;
  }

  async logout(): Promise<void> {
    // Clear the token
    this.setAccessToken(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_permissions');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('sessionid');
  }

  // User Roles API methods
  async fetchBranchRoles(organizationId: string): Promise<UserRolesResponse> {
    return this.makeRequest<UserRolesResponse>(`accounts/roles/?organization_id=${organizationId}`);
  }

  async fetchRolePermissions(branchId: number, roleId: string): Promise<RolePermissionsResponse> {
    return this.makeRequest<RolePermissionsResponse>(`tenants/branches/${branchId}/roles/${roleId}/permissions/`);
  }

  async fetchAllPermissions(): Promise<AllPermissionsResponse> {
    return this.makeRequest<AllPermissionsResponse>('accounts/permissions/');
  }

  async createRole(roleData: CreateRoleRequest): Promise<CreateRoleResponse> {
    return this.makeRequest<CreateRoleResponse>(`accounts/roles/`, {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async addRolePermissions(branchId: number, roleId: string, permissionsData: AddPermissionsRequest): Promise<AddPermissionsResponse> {
    return this.makeRequest<AddPermissionsResponse>(`tenants/branches/${branchId}/roles/${roleId}/permissions/`, {
      method: 'POST',
      body: JSON.stringify(permissionsData),
    });
  }

  async removeRolePermissions(branchId: number, roleId: string, permissionsData: RemovePermissionsRequest): Promise<RemovePermissionsResponse> {
    return this.makeRequest<RemovePermissionsResponse>(`tenants/branches/${branchId}/roles/${roleId}/permissions/`, {
      method: 'DELETE',
      body: JSON.stringify(permissionsData),
    });
  }

  // Branch Users API methods
  async fetchBranchUsers(organizationId: string): Promise<OrganizationUsersResponse> {
    return this.makeRequest<OrganizationUsersResponse>(`accounts/users/?organization_id=${organizationId}`);
  }

  async createBranchUser(branchId: number, userData: CreateUserRequest): Promise<CreateUserResponse> {
    return this.makeRequest<CreateUserResponse>(`tenants/branches/${branchId}/users/`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async changeUserPassword(userId: string, passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return this.makeRequest<ChangePasswordResponse>(`accounts/users/${userId}/change-password/`, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async fetchUserProfile(branchId: number, userId: number): Promise<UserProfileResponse> {
    return this.makeRequest<UserProfileResponse>(`tenants/branches/${branchId}/users/${userId}/`);
  }

  // Organization Users API methods
  async fetchOrganizationUsers(organizationId: string): Promise<OrganizationUsersResponse> {
    return this.makeRequest<OrganizationUsersResponse>(`accounts/users/?organization_id=${organizationId}`);
  }

  async fetchCurrentUserProfile(): Promise<CurrentUserProfileResponse> {
    return this.makeRequest<CurrentUserProfileResponse>('accounts/users/me/');
  }

  // Exchange Rates API methods
  async fetchDailyExchangeRates(branchId: number, date?: string): Promise<DailyExchangeRatesResponse> {
    const currentDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return this.makeRequest<DailyExchangeRatesResponse>(`tenants/branches/${branchId}/daily-exchange-rates/?date=${currentDate}`);
  }

  async fetchExchangeRatesStatus(branchId: number, date?: string): Promise<ExchangeRatesStatusResponse> {
    const currentDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return this.makeRequest<ExchangeRatesStatusResponse>(`tenants/branches/${branchId}/daily-exchange-rates/status/?date=${currentDate}`);
  }

  // CRM Tickets API methods
  async fetchTickets(): Promise<TicketsResponse> {
    return this.makeRequest<TicketsResponse>('crm/tickets/');
  }

  async fetchTicketDetails(ticketId: number): Promise<TicketDetailsResponse> {
    return this.makeRequest<TicketDetailsResponse>(`crm/tickets/${ticketId}/`);
  }

  async createTicket(ticketData: CreateTicketRequest): Promise<CreateTicketResponse> {
    return this.makeRequest<CreateTicketResponse>('crm/tickets/', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(ticketId: number, ticketData: UpdateTicketRequest): Promise<UpdateTicketResponse> {
    const url = `${this.baseURL}crm/tickets/${ticketId}/`;
    
    // Check if there are attachments to upload
    const hasAttachments = ticketData.attachments && ticketData.attachments.length > 0;
    
    if (hasAttachments && ticketData.attachments) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('title', ticketData.title);
      formData.append('description', ticketData.description);
      formData.append('category', ticketData.category);
      formData.append('priority', ticketData.priority);
      
      // Append assigned user IDs
      ticketData.assigned_to_ids.forEach((userId) => {
        formData.append('assigned_to_ids', userId);
      });
      
      // Append attachments
      ticketData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const headers: HeadersInit & { Authorization?: string } = {};
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData.error || 'Request failed',
          errorData.violations,
          errorData.warnings,
          errorData.details || errorData
        );
      }

      return response.json();
    } else {
      // Use JSON for requests without attachments
      const { attachments, ...jsonData } = ticketData;
      return this.makeRequest<UpdateTicketResponse>(`crm/tickets/${ticketId}/`, {
        method: 'PUT',
        body: JSON.stringify(jsonData),
      });
    }
  }

  async createTicketComment(commentData: CreateCommentRequest): Promise<CreateCommentResponse> {
    return this.makeRequest<CreateCommentResponse>('crm/tickets/add-comment/', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async closeTicket(ticketId: number, closeData: CloseTicketRequest): Promise<CloseTicketResponse> {
    return this.makeRequest<CloseTicketResponse>(`crm/tickets/${ticketId}/close/`, {
      method: 'POST',
      body: JSON.stringify(closeData),
    });
  }

  // Notifications API methods
  async fetchNotifications(): Promise<NotificationsResponse> {
    return this.makeRequest<NotificationsResponse>('crm/notifications/');
  }

  async fetchUnreadNotificationCount(): Promise<UnreadCountResponse> {
    return this.makeRequest<UnreadCountResponse>('crm/notifications/unread-count/');
  }

  async markNotificationAsRead(notificationId: number): Promise<{ data: Notification }> {
    return this.makeRequest<{ data: Notification }>(`crm/notifications/${notificationId}/mark-as-read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.makeRequest<void>('crm/notifications/mark-all-read/', {
      method: 'POST',
    });
  }

  // KPIs API methods
  async fetchKPIs(organizationId: string, branchId: string): Promise<KPIsResponse> {
    return this.makeRequest<KPIsResponse>(`kpis/?organization_id=${organizationId}&branch_id=${branchId}`);
  }

  async fetchKPIDetails(kpiId: string): Promise<KPIDetailsResponse> {
    return this.makeRequest<KPIDetailsResponse>(`kpis/${kpiId}/`);
  }

  async fetchKPITrends(kpiId: string): Promise<KPITrendsResponse> {
    return this.makeRequest<KPITrendsResponse>(`kpis/${kpiId}/trends/`);
  }

  async createKPI(kpiData: CreateKPIRequest): Promise<CreateKPIResponse> {
    return this.makeRequest<CreateKPIResponse>('kpis/', {
      method: 'POST',
      body: JSON.stringify(kpiData),
    });
  }

  // KPI Approvals API methods
  async fetchKPIApprovals(organizationId: string, status: 'submitted' | 'approved' | 'rejected' = 'submitted', kpiId?: string): Promise<KPIApprovalsResponse> {
    let url = `kpis/kpi-reports/approvals/?organization_id=${organizationId}&status=${status}`;
    if (kpiId) {
      url += `&kpi_id=${kpiId}`;
    }
    return this.makeRequest<KPIApprovalsResponse>(url);
  }

  async approveKPIReport(reportId: string, action: 'approve' | 'reject', notes: string): Promise<ApproveKPIResponse> {
    return this.makeRequest<ApproveKPIResponse>(`kpis/kpi-reports/${reportId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    });
  }

  async fetchMyKPIs(): Promise<MyKPIPortfolioResponse> {
    return this.makeRequest<MyKPIPortfolioResponse>('kpis/my-kpis/');
  }

  // KPI Reports API methods
  async fetchKPIReports(): Promise<KPIReportsResponse> {
    return this.makeRequest<KPIReportsResponse>('kpis/kpi-reports/');
  }

  async createKPIReport(reportData: CreateKPIReportRequest): Promise<CreateKPIReportResponse> {
    return this.makeRequest<CreateKPIReportResponse>('kpis/kpi-reports/', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async submitKPIReport(reportId: string): Promise<CreateKPIReportResponse> {
    return this.makeRequest<CreateKPIReportResponse>(`kpis/kpi-reports/${reportId}/submit/`, {
      method: 'POST',
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Export the API base URL for other uses
export { API_BASE_URL };
