import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { API_ANALYTICS_ROUTES } from '@core/routes/analytics/analytics.routes';
import { I18nService } from '@core/services/i18n/i18n.service';
import { RequestStateService } from '@core/services/request-state/request-state.service';
import { StorageMap } from '@ngx-pwa/local-storage';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

export interface IAnalyticsEvent {
  type: 'project_view' | 'cv_download' | 'cta_click' | 'link_click' | 'page_visit' | string;
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
  groupedByProject: Array<{ _id: string | null; projectName: string; total: number }>;
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

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService extends GlobalHttpService {
  private sessionId = this.generateSessionId();
  private readonly sessionIdReady: Promise<void>;

  constructor(
    httpClient: HttpClient,
    storageMap: StorageMap,
    private readonly i18nService: I18nService,
    ngZone: NgZone,
    requestStateService: RequestStateService,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    super(httpClient, storageMap, ngZone, requestStateService, platformId);
    this.sessionIdReady = this.initializeSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private async initializeSessionId(): Promise<void> {
    const stored = await this.getStorage(NgStorage.ANALYTICS_SESSION_ID) as string | null;

    if (stored) {
      this.sessionId = stored;
      return;
    }

    await this.setStorage(NgStorage.ANALYTICS_SESSION_ID, this.sessionId);
  }

  async trackEvent(event: IAnalyticsEvent): Promise<void> {
    await this.sessionIdReady;

    const enrichedEvent = {
      ...event,
      path: event.path || this.getCurrentPath(),
      sessionId: this.sessionId,
      language: this.getLanguage(),
    };

    try {
      await this.makeRequest<Record<string, unknown>, IAnalyticsEvent>(
        API_ANALYTICS_ROUTES.trackEvent,
        enrichedEvent,
        RequestMethod.POST,
      );
    } catch (error) {
      // Silently fail - don't disrupt user experience if analytics fails
      console.debug('Analytics tracking failed:', error);
    }
  }

  async trackProjectView(projectId: string): Promise<void> {
    await this.trackEvent({
      type: 'project_view',
      path: this.getCurrentPath(),
      projectId,
    });
  }

  async trackCVDownload(cvName: string): Promise<void> {
    await this.trackEvent({
      type: 'cv_download',
      path: this.getCurrentPath(),
      meta: { cvName },
    });
  }

  async trackCTAClick(ctaName: string, target?: string): Promise<void> {
    await this.trackEvent({
      type: 'cta_click',
      path: this.getCurrentPath(),
      meta: { ctaName, target },
    });
  }

  async trackLinkClick(href: string, linkText?: string): Promise<void> {
    await this.trackEvent({
      type: 'link_click',
      path: this.getCurrentPath(),
      meta: { href, linkText },
    });
  }

  async trackPageVisit(path?: string): Promise<void> {
    await this.trackEvent({
      type: 'page_visit',
      path: path || this.getCurrentPath(),
    });
  }

  async getDashboardMetrics(): Promise<IDashboardMetrics> {
    return this.makeRequest<IDashboardMetrics, null>(
      API_ANALYTICS_ROUTES.getDashboardMetrics,
      null,
      RequestMethod.GET,
    );
  }

  private getCurrentPath(): string {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  }

  private getLanguage(): string {
    return this.i18nService.currentLanguage();
  }
}
