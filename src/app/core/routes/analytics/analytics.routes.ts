import { environment } from 'src/environments/environment';

export const API_ANALYTICS_ROUTES = {
    trackEvent: `${environment.apiUrl}/analytics/event`,
    getDashboardMetrics: `${environment.apiUrl}/admin/dashboard/metrics`,
};
