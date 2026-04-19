import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService, IDashboardMetrics } from '@core/services/analytics/analytics.service';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
    metrics: IDashboardMetrics | null = null;
    loading = true;
    authenticated = false;
    email = '';
    password = '';
    error: string | null = null;
    Object = Object;
    private readonly isBrowser: boolean;

    constructor(
        private analyticsService: AnalyticsService,
        private adminAuthService: AdminAuthService,
        private router: Router,
        private route: ActivatedRoute,
        public i18nService: I18nService,
        @Inject(PLATFORM_ID) platformId: object,
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    async ngOnInit(): Promise<void> {
        await this.checkAuthentication();
    }

    private async checkAuthentication(): Promise<void> {
        if (!this.isBrowser) {
            this.loading = false;
            return;
        }

        const isAuthenticated = await this.adminAuthService.isAuthenticated();

        if (isAuthenticated) {
            this.authenticated = true;
            await this.loadMetrics();
        } else {
            this.loading = false;
        }
    }

    async authenticate(): Promise<void> {
        if (this.email && this.password) {
            await this.adminAuthService.login(this.email, this.password);
            this.authenticated = true;
            this.error = null;
            await this.loadMetrics();
        } else {
            this.error = 'Email and password are required.';
        }
    }

    async loadMetrics(): Promise<void> {
        try {
            this.loading = true;
            this.error = null;
            this.metrics = await this.analyticsService.getDashboardMetrics();
        } catch (err) {
            this.error = err instanceof Error ? err.message : 'Failed to load metrics';
            console.error('Error loading metrics:', err);
        } finally {
            this.loading = false;
        }
    }

    async logout(): Promise<void> {
        await this.adminAuthService.logout();
        this.authenticated = false;
        this.email = '';
        this.password = '';
        this.metrics = null;
    }

    getMetricTotal(type: string): number {
        return this.metrics?.groupedTotals?.find((item) => item._id === type)?.total ?? 0;
    }

    t(key: string): string {
        return this.i18nService.t(key);
    }
}
