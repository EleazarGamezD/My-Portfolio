import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AdminPortfolioMediaSectionComponent } from '@pages/admin-dashboard/components/portfolio-media-section/portfolio-media-section.component';

@Component({
  selector: 'app-admin-portfolio-media-page',
  standalone: true,
  imports: [AdminPortfolioMediaSectionComponent],
  templateUrl: './portfolio-media-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./portfolio-media-page.component.scss'],
})
export class AdminPortfolioMediaPageComponent implements OnInit {
  readonly facade = inject(AdminDashboardFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.facade.loadProfileContent();
    this.cdr.detectChanges();
  }
}
