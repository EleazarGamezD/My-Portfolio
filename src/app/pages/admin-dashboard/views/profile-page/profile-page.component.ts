import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminProfileSectionComponent } from '@pages/admin-dashboard/components/profile-section/profile-section.component';
import { AlertModule } from '@coreui/angular';

@Component({
  selector: 'app-admin-profile-page',
  standalone: true,
  imports: [CommonModule, AlertModule, AdminProfileSectionComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class AdminProfilePageComponent implements OnInit {
  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.facade.ensureContentReady();
    this.cdr.detectChanges();
  }
}
