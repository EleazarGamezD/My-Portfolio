import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { AlertModule } from '@coreui/angular';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { ExperienceListComponent } from '@pages/admin-dashboard/components/experience-list/experience-list.component';

@Component({
  selector: 'app-admin-experience-page',
  standalone: true,
  imports: [AlertModule, ExperienceListComponent],
  templateUrl: './experience-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experience-page.component.scss',
})
export class AdminExperiencePageComponent implements OnInit {
  readonly facade = inject(AdminDashboardFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.facade.loadExperienceContent();
    this.cdr.detectChanges();
  }
}
