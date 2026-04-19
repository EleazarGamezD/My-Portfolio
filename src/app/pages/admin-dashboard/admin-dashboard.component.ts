import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IAdminDashboardFilters } from '@core/interfaces/admin/admin.interface';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { IDashboardMetrics } from '@core/services/analytics/analytics.service';
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
  error: string | null = null;
  readonly filters: IAdminDashboardFilters = {
    year: '',
    month: '',
    day: '',
    from: '',
    to: '',
  };

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router,
    public readonly i18nService: I18nService,
  ) { }

  async ngOnInit(): Promise<void> {
    const authenticated = await this.adminAuthService.isAuthenticated();

    if (!authenticated) {
      await this.router.navigate(['/admin/login'], {
        queryParams: { redirectTo: '/admin/dashboard' },
      });
      return;
    }

    await this.loadMetrics();
  }

  async loadMetrics(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.metrics = await this.adminAuthService.getDashboardMetrics(this.filters);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load metrics';
      console.error('Error loading metrics:', err);
    } finally {
      this.loading = false;
    }
  }

  async applyFilters(): Promise<void> {
    await this.loadMetrics();
  }

  async clearFilters(): Promise<void> {
    this.filters.year = '';
    this.filters.month = '';
    this.filters.day = '';
    this.filters.from = '';
    this.filters.to = '';
    await this.loadMetrics();
  }

  async logout(): Promise<void> {
    await this.adminAuthService.logout();
    this.metrics = null;
    await this.router.navigateByUrl('/admin/login');
  }

  getMetricTotal(type: string): number {
    return this.metrics?.groupedTotals?.find((item) => item._id === type)?.total ?? 0;
  }
}
