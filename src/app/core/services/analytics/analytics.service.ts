import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { API_ANALYTICS_ROUTES } from '@core/routes/analytics/analytics.routes';
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
    projectViews: Record<string, number>;
    cvDownloads: number;
    ctaClicks: number;
    topPages: Array<{ path: string; count: number }>;
    topProjects: Array<{ projectId: string; views: number }>;
    [key: string]: unknown;
}

@Injectable({
    providedIn: 'root',
})
export class AnalyticsService extends GlobalHttpService {
    private sessionId: string = this.generateSessionId();

    constructor(httpClient: HttpClient) {
        super(httpClient);
        this.initializeSessionId();
    }

    private generateSessionId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private initializeSessionId(): void {
        if (typeof sessionStorage !== 'undefined') {
            const stored = sessionStorage.getItem('analytics_session_id');
            if (stored) {
                this.sessionId = stored;
            } else {
                sessionStorage.setItem('analytics_session_id', this.sessionId);
            }
        }
    }

    async trackEvent(event: IAnalyticsEvent): Promise<void> {
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
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('language') || 'es';
        }
        return 'es';
    }
}
