import { environment } from 'src/environments/environment';

export const API_ADMIN_ROUTES = {
  login: `${environment.apiUrl}/admin/auth/login`,
  me: `${environment.apiUrl}/admin/me`,
  dashboardMetrics: `${environment.apiUrl}/admin/dashboard/metrics`,
};
