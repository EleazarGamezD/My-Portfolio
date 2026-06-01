import { environment } from '../../../../environments/environment';


export const API_ADMIN_ROUTES = {
  login: `${environment.apiUrl}/admin/auth/login`,
  setupAccount: `${environment.apiUrl}/admin/auth/setup-account`,
  forgotPassword: `${environment.apiUrl}/admin/auth/forgot-password`,
  resetPassword: `${environment.apiUrl}/admin/auth/reset-password`,
  me: `${environment.apiUrl}/admin/me`,
  users: `${environment.apiUrl}/admin/users`,
  updateUser: (id: string) => `${environment.apiUrl}/admin/users/${id}`,
  dashboardMetrics: `${environment.apiUrl}/admin/dashboard/metrics`,
  seedStatus: `${environment.apiUrl}/admin/seed-status`,
  seedInitial: `${environment.apiUrl}/admin/seed-initial`,
  seedDemoPersonal: `${environment.apiUrl}/admin/seed-demo-personal`,
};
