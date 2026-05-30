import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { ContentService } from '@core/services/content/content.service';
import { SkillsListComponent } from '@pages/admin-dashboard/components/skills-list/skills-list.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-skills-page',
  standalone: true,
  imports: [CommonModule, SkillsListComponent],
  templateUrl: './skills-page.component.html',
})
export class AdminSkillsPageComponent implements OnInit {
  skills: IApiTechSkill[] = [];
  loading = true;
  deletingSkillId: string | null = null;
  readonly pageSize = 6;
  pagination: IPaginationResponse<IApiTechSkill> = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  constructor(
    private readonly contentService: ContentService,
    private readonly toastr: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadSkillsPage();
  }

  async changePage(page: number): Promise<void> {
    await this.loadSkillsPage(page);
  }

  async deleteSkill(skill: IApiTechSkill): Promise<void> {
    if (!skill._id) {
      return;
    }

    this.deletingSkillId = skill._id;

    try {
      await this.contentService.deleteContentItem('techSkills', skill._id);
      this.toastr.success(`${skill.label?.es || skill.value || 'Skill'} eliminada.`, 'Panel');

      const targetPage =
        this.skills.length === 1 && this.pagination.currentPage > 1
          ? this.pagination.currentPage - 1
          : this.pagination.currentPage;

      await this.loadSkillsPage(targetPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar la skill.';
      this.toastr.error(message, 'Panel');
    } finally {
      this.deletingSkillId = null;
      this.cdr.detectChanges();
    }
  }

  private async loadSkillsPage(page = this.pagination.currentPage): Promise<void> {
    this.loading = true;

    try {
      const response = await this.contentService.getTechSkillsPaginated({
        page,
        limit: this.pageSize,
        sortBy: 'order',
        sortOrder: 'asc',
      });

      this.pagination = response;
      this.skills = response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudieron cargar las skills.';
      this.toastr.error(message, 'Panel');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
