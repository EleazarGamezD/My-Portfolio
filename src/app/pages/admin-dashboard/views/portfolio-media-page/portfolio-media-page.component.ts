import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminPortfolioMediaSectionComponent } from '@pages/admin-dashboard/components/portfolio-media-section/portfolio-media-section.component';

@Component({
  selector: 'app-admin-portfolio-media-page',
  standalone: true,
  imports: [CommonModule, AdminPortfolioMediaSectionComponent],
  templateUrl: './portfolio-media-page.component.html',
  styleUrls: ['./portfolio-media-page.component.scss'],
})
export class AdminPortfolioMediaPageComponent implements OnInit {
  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.facade.loadProfileContent();
    this.cdr.detectChanges();
  }
}
