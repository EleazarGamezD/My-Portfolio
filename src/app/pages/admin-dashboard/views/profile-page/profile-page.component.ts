import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminProfileSectionComponent } from '@pages/admin-dashboard/components/profile-section/profile-section.component';
import { AlertModule } from '@coreui/angular';

@Component({
  selector: 'app-admin-profile-page',
  standalone: true,
  imports: [AlertModule, AdminProfileSectionComponent],
  templateUrl: './profile-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile-page.component.scss',
})
export class AdminProfilePageComponent implements OnInit {
  readonly facade = inject(AdminDashboardFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.facade.loadProfileContent();
    this.cdr.detectChanges();
  }
}
