import { environment } from '../../../../environments/environment';


export const API_ADMIN_ROUTES = {
  login: `${environment.apiUrl}/admin/auth/login`,
  me: `${environment.apiUrl}/admin/me`,
  users: `${environment.apiUrl}/admin/users`,
  updateUser: (id: string) => `${environment.apiUrl}/admin/users/${id}`,
  dashboardMetrics: `${environment.apiUrl}/admin/dashboard/metrics`,
};
