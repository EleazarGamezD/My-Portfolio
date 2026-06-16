import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AlertModule } from '@coreui/angular';
import { ProjectsListComponent } from '@pages/admin-dashboard/components/projects-list/projects-list.component';

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [AlertModule, ProjectsListComponent],
  templateUrl: './projects-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './projects-page.component.scss',
})
export class AdminProjectsPageComponent implements OnInit {
  readonly facade = inject(AdminDashboardFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.facade.loadProjectsPage();
    this.cdr.detectChanges();
  }
}
