
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { BadgeModule, ButtonModule, SpinnerModule } from '@coreui/angular';
import { AdminActionMenuAction, AdminActionMenuComponent } from '../admin-action-menu/admin-action-menu.component';

@Component({
  selector: 'app-skills-list',
  standalone: true,
  imports: [RouterLink, ButtonModule, BadgeModule, SpinnerModule, AdminActionMenuComponent],
  templateUrl: './skills-list.component.html',
  styleUrl: './skills-list.component.scss',
})
export class SkillsListComponent {
  @Input() skills: IApiTechSkill[] = [];
  @Input() loading = false;
  @Input() deletingSkillId: string | null = null;
  @Input() pagination: IPaginationResponse<IApiTechSkill> = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  @Output() deleteSkill = new EventEmitter<IApiTechSkill>();
  @Output() pageChange = new EventEmitter<number>();

  getSkillLabel(skill: IApiTechSkill): string {
    return skill.label?.es || skill.label?.en || skill.value || 'Skill';
  }

  getSkillIcon(skill: IApiTechSkill): string | null {
    return resolveImageAssetUrl(skill.icon ?? null);
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

  handleAction(skill: IApiTechSkill, action: AdminActionMenuAction): void {
    if (action === 'delete') {
      this.deleteSkill.emit(skill);
    }
  }

  isDeleting(skill: IApiTechSkill): boolean {
    return Boolean(skill._id && this.deletingSkillId === skill._id);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.pagination.totalPages || page === this.pagination.currentPage) {
      return;
    }

    this.pageChange.emit(page);
  }
}
