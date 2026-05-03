import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IPaginationResponse, IProject } from '@core/interfaces/projects/projects.interfaces';
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
  @Input() pagination: IPaginationResponse<IProject> = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  @Output() deleteProject = new EventEmitter<IProject>();
  @Output() deactivateProject = new EventEmitter<IProject>();
  @Output() pageChange = new EventEmitter<number>();

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

  formatPublishedDate(value?: string): string {
    if (!value) {
      return '-';
    }

    const parsedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);
  }

  get visiblePages(): number[] {
    if (this.pagination.totalPages <= 1) {
      return this.pagination.totalPages === 1 ? [1] : [];
    }

    const startPage = Math.max(1, this.pagination.currentPage - 2);
    const endPage = Math.min(this.pagination.totalPages, startPage + 4);
    const adjustedStart = Math.max(1, endPage - 4);
    const pages: number[] = [];

    for (let page = adjustedStart; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
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

  changePage(page: number): void {
    if (page < 1 || page > this.pagination.totalPages || page === this.pagination.currentPage) {
      return;
    }

    this.pageChange.emit(page);
  }
}
