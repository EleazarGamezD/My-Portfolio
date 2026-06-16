export interface IAnalyticsEvent {
  type:
    | 'project_view'
    | 'cv_download'
    | 'cta_click'
    | 'link_click'
    | 'page_visit'
    | string;
  path: string;
  projectId?: string;
  language?: string;
  sessionId?: string;
  meta?: Record<string, unknown>;
}

export interface IDashboardMetrics {
  totalEvents: number;
  filters?: Record<string, unknown>;
  groupedTotals: Array<{ _id: string; total: number }>;
  groupedByPath: Array<{ _id: string; total: number }>;
  groupedByProject: Array<{
    _id: string | null;
    projectName: string;
    total: number;
  }>;
  allProjectViews: Array<{
    _id: string | null;
    projectName: string;
    total: number;
  }>;
  groupedByLanguage: Array<{ _id: string; total: number }>;
  groupedByDay: Array<{ _id: string; total: number }>;
  recentEvents: Array<{
    _id?: string;
    type: string;
    path: string;
    projectId: string | null;
    language: string;
    createdAt: string;
  }>;
  [key: string]: unknown;
}
