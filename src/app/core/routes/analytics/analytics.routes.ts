import { environment } from "../../../../environments/environment.example";

export const API_ANALYTICS_ROUTES = {
  trackEvent: `${environment.apiUrl}/analytics/event`,
  getDashboardMetrics: `${environment.apiUrl}/admin/dashboard/metrics`,
};
