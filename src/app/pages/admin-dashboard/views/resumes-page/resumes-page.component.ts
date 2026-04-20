import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminResumesSectionComponent } from '@pages/admin-dashboard/components/resumes-section/resumes-section.component';
import { AlertModule } from '@coreui/angular';

@Component({
  selector: 'app-admin-resumes-page',
  standalone: true,
  imports: [CommonModule, AlertModule, AdminResumesSectionComponent],
  templateUrl: './resumes-page.component.html',
  styleUrl: './resumes-page.component.scss',
})
export class AdminResumesPageComponent implements OnInit {
  constructor(public readonly facade: AdminDashboardFacade) {}

  async ngOnInit(): Promise<void> {
    await this.facade.ensureContentReady();
  }
}
