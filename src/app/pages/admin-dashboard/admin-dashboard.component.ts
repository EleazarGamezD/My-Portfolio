import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService, IDashboardMetrics } from '@core/services/analytics/analytics.service';
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
    apiKey = '';
    error: string | null = null;
    Object = Object;

    constructor(
        private analyticsService: AnalyticsService,
        private router: Router,
        private route: ActivatedRoute,
        public i18nService: I18nService
    ) { }

    ngOnInit(): void {
        this.checkAuthentication();
    }

    private checkAuthentication(): void {
        // Check if admin key is in sessionStorage
        const storedKey = sessionStorage.getItem('admin_api_key');
        if (storedKey) {
            this.apiKey = storedKey;
            this.authenticated = true;
            this.loadMetrics();
        } else {
            this.loading = false;
        }
    }

    async authenticate(key: string): Promise<void> {
        // In a real app, you would validate the key with the backend
        // For now, we'll assume any non-empty key is valid
        if (key && key.length > 0) {
            this.apiKey = key;
            sessionStorage.setItem('admin_api_key', key);
            this.authenticated = true;
            this.error = null;
            this.loadMetrics();
        } else {
            this.error = 'Invalid API key';
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

    logout(): void {
        sessionStorage.removeItem('admin_api_key');
        this.authenticated = false;
        this.apiKey = '';
        this.metrics = null;
    }

    t(key: string): string {
        return this.i18nService.t(key);
    }
}
