import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IDashboardMetrics } from '@core/services/analytics/analytics.service';

@Component({
  selector: 'app-admin-overview-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview-section.component.html',
  styleUrl: './overview-section.component.scss',
})
export class AdminOverviewSectionComponent {
  @Input({ required: true }) metrics!: IDashboardMetrics;
  @Input() loading = false;

  getMetricTotal(type: string): number {
    return this.metrics?.groupedTotals?.find((item) => item._id === type)?.total ?? 0;
  }
}
