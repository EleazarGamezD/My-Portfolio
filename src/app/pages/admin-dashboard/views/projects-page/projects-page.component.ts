import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AlertModule } from '@coreui/angular';
import { ProjectsListComponent } from '@pages/admin-dashboard/components/projects-list/projects-list.component';

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [CommonModule, AlertModule, ProjectsListComponent],
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.scss',
})
export class AdminProjectsPageComponent implements OnInit {
  constructor(public readonly facade: AdminDashboardFacade) {}

  async ngOnInit(): Promise<void> {
    await this.facade.ensureContentReady();
  }
}
