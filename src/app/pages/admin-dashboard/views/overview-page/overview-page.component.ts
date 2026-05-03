import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminOverviewSectionComponent } from '@pages/admin-dashboard/components/overview-section/overview-section.component';
import {
  AlertModule,
  ButtonModule,
  CardModule,
  SpinnerModule,
} from '@coreui/angular';

@Component({
  selector: 'app-admin-overview-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AlertModule,
    ButtonModule,
    CardModule,
    SpinnerModule,
    AdminOverviewSectionComponent,
  ],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.scss',
})
export class AdminOverviewPageComponent implements OnInit {
  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.facade.ensureOverviewReady();
    this.cdr.detectChanges();
  }
}
