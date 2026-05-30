import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { IDashboardMetrics } from '@core/services/analytics/analytics.service';
import {
  AlertModule,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  CardModule,
  FormModule,
  SpinnerModule,
  TableDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { getStyle } from '@coreui/utils';
import { ChartData, ChartOptions } from 'chart.js';

const EVENT_TYPE_LABELS: Record<string, string> = {
  page_view: 'Vista de página',
  project_view: 'Vista de proyecto',
  cv_download: 'Descarga CV',
  cta_click: 'Click CTA',
  link_click: 'Click enlace',
  page_visit: 'Visita',
};

@Component({
  selector: 'app-admin-overview-page',
  templateUrl: 'overview-page.component.html',
  styleUrls: ['overview-page.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    CardModule,
    ButtonDirective,
    ChartjsComponent,
    TableDirective,
    AlertModule,
    SpinnerModule,
    FormModule,
  ],
})
export class AdminOverviewPageComponent implements OnInit {
  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.facade.ensureOverviewReady();
    this.cdr.detectChanges();
  }

  get kpiPageViews(): number {
    return this.getTotal('page_view') + this.getTotal('page_visit');
  }

  get kpiProjectViews(): number {
    return this.getTotal('project_view');
  }

  get kpiCvDownloads(): number {
    return this.getTotal('cv_download');
  }

  get eventTypeChart(): { data: ChartData; options: ChartOptions } | null {
    const metrics = this.facade.metrics;
    if (!metrics?.groupedTotals?.length) return null;

    const labels = metrics.groupedTotals.map(
      (item) => EVENT_TYPE_LABELS[item._id] ?? item._id,
    );
    const data = metrics.groupedTotals.map((item) => item.total);

    return {
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              getStyle('--cui-primary'),
              getStyle('--cui-success'),
              getStyle('--cui-info'),
              getStyle('--cui-warning'),
              getStyle('--cui-danger'),
              getStyle('--cui-secondary'),
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    };
  }

  get projectViewsChart(): { data: ChartData; options: ChartOptions } | null {
    const metrics = this.facade.metrics;
    if (!metrics?.groupedByProject?.length) return null;

    const filtered = metrics.groupedByProject.filter((p) => p._id !== null);
    if (!filtered.length) return null;

    const labels = filtered.map((p) => p.projectName ?? p._id ?? 'Sin nombre');
    const data = filtered.map((p) => p.total);

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Vistas',
            data,
            backgroundColor: getStyle('--cui-info'),
          },
        ],
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    };
  }

  get allProjectViewsChart(): { data: ChartData; options: ChartOptions; height: number } | null {
    const metrics = this.facade.metrics;
    if (!metrics?.allProjectViews?.length) return null;

    const items = metrics.allProjectViews.filter((p) => p._id !== null);
    if (!items.length) return null;

    const labels = items.map((p) => p.projectName ?? p._id ?? 'Sin nombre');
    const data = items.map((p) => p.total);
    const height = Math.max(200, items.length * 32 + 60);

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Vistas',
            data,
            backgroundColor: getStyle('--cui-success'),
          },
        ],
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
      },
      height,
    };
  }

  get timelineChart(): { data: ChartData; options: ChartOptions } | null {
    const metrics = this.facade.metrics;
    if (!metrics?.groupedByDay?.length) return null;

    const labels = metrics.groupedByDay.map((d) => d._id);
    const data = metrics.groupedByDay.map((d) => d.total);

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Eventos',
            data,
            fill: true,
            tension: 0.4,
            borderColor: getStyle('--cui-primary'),
            backgroundColor: getStyle('--cui-primary') + '33',
            pointBackgroundColor: getStyle('--cui-primary'),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { maxTicksLimit: 10 } },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    };
  }

  getEventTypeLabel(type: string): string {
    return EVENT_TYPE_LABELS[type] ?? type;
  }

  getMetrics(): IDashboardMetrics | null {
    return this.facade.metrics;
  }

  private getTotal(type: string): number {
    return (
      this.facade.metrics?.groupedTotals?.find((t) => t._id === type)?.total ??
      0
    );
  }
}
