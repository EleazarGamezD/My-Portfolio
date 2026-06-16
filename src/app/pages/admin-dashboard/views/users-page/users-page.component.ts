import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminUsersSectionComponent } from '@pages/admin-dashboard/components/users-section/users-section.component';
import { AlertModule } from '@coreui/angular';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [AlertModule, AdminUsersSectionComponent],
  templateUrl: './users-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users-page.component.scss',
})
export class AdminUsersPageComponent implements OnInit {
  readonly facade = inject(AdminDashboardFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.facade.loadAdminUsers();
    this.cdr.detectChanges();
  }
}
