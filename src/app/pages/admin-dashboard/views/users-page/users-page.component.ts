import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminUsersSectionComponent } from '@pages/admin-dashboard/components/users-section/users-section.component';
import { AlertModule } from '@coreui/angular';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, AlertModule, AdminUsersSectionComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class AdminUsersPageComponent implements OnInit {
  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.facade.ensureContentReady();
    this.cdr.detectChanges();
  }
}
