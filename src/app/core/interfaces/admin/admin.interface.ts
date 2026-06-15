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
  mustChangePassword?: boolean;
}

export interface IAdminLoginRequest {
  email: string;
  password: string;
}

export interface IAdminLoginResponse {
  authenticated: boolean;
  accessToken: string;
  tokenType: 'Bearer';
  mustChangePassword?: boolean;
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

export interface ISetupAccountRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface ISetupAccountResponse {
  configured: boolean;
  accessToken: string;
  tokenType: 'Bearer';
  user: IAdminUser;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IForgotPasswordResponse {
  sent: boolean;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface IResetPasswordResponse {
  reset: boolean;
}
