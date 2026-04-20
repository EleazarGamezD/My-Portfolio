import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminProjectsSectionComponent } from '@pages/admin-dashboard/components/projects-section/projects-section.component';
import { AlertModule } from '@coreui/angular';

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [CommonModule, AlertModule, AdminProjectsSectionComponent],
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.scss',
})
export class AdminProjectsPageComponent implements OnInit {
  constructor(public readonly facade: AdminDashboardFacade) {}

  async ngOnInit(): Promise<void> {
    await this.facade.ensureContentReady();
  }
}
