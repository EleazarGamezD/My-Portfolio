import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { BadgeModule, ButtonModule, SpinnerModule, TableModule } from '@coreui/angular';
import { AdminActionMenuAction, AdminActionMenuComponent } from '../admin-action-menu/admin-action-menu.component';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    ButtonModule,
    BadgeModule,
    SpinnerModule,
    AdminActionMenuComponent,
  ],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss',
})
export class ProjectsListComponent {
  @Input() projects: IProject[] = [];
  @Input() loading = false;
  @Input() actionLoadingKey: string | null = null;
  @Output() deleteProject = new EventEmitter<IProject>();
  @Output() deactivateProject = new EventEmitter<IProject>();

  constructor(private readonly i18nService: I18nService) {}

  getProjectTitle(project: IProject): string {
    return this.i18nService.selectText(
      project.title?.es || '',
      project.title?.en || project.title?.es || '',
    ) || '-';
  }

  getSummary(project: IProject): string {
    return this.i18nService.selectText(
      project.summary?.es || '',
      project.summary?.en || project.summary?.es || '',
    ) || '-';
  }

  getStatusColor(status?: string): 'success' | 'warning' | 'secondary' | 'info' {
    switch ((status || '').toLowerCase()) {
      case 'published':
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'secondary';
      default:
        return 'info';
    }
  }

  getCoverPreview(project: IProject): string | null {
    return resolveImageAssetUrl(project.coverImage) || resolveImageAssetUrl(project.images?.[0]);
  }

  isDeleting(project: IProject): boolean {
    return this.actionLoadingKey === `project-delete-${project._id}`;
  }

  isSaving(project: IProject): boolean {
    return this.actionLoadingKey === `project-save-${project._id}`;
  }

  handleAction(project: IProject, action: AdminActionMenuAction): void {
    if (action === 'delete') {
      this.deleteProject.emit(project);
      return;
    }

    if (action === 'deactivate') {
      this.deactivateProject.emit(project);
    }
  }
}
