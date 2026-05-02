import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertModule } from '@coreui/angular';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { ExperienceListComponent } from '@pages/admin-dashboard/components/experience-list/experience-list.component';

@Component({
  selector: 'app-admin-experience-page',
  standalone: true,
  imports: [CommonModule, AlertModule, ExperienceListComponent],
  templateUrl: './experience-page.component.html',
  styleUrl: './experience-page.component.scss',
})
export class AdminExperiencePageComponent implements OnInit {
  constructor(public readonly facade: AdminDashboardFacade) {}

  async ngOnInit(): Promise<void> {
    await this.facade.ensureContentReady();
  }
}
