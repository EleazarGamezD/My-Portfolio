export interface IAdminUser {
  _id?: string;
  email: string;
  username: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'editor';
  active: boolean;
  lastLoginAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAdminLoginRequest {
  email: string;
  password: string;
}

export interface IAdminLoginResponse {
  authenticated: boolean;
  accessToken: string;
  tokenType: 'Bearer';
  user: IAdminUser;
}

export interface IAdminMeResponse {
  authenticated: boolean;
  user: IAdminUser | null;
}

export interface IAdminUsersResponse {
  users: IAdminUser[];
}

export interface IAdminDashboardFilters {
  year?: string;
  month?: string;
  day?: string;
  from?: string;
  to?: string;
}
