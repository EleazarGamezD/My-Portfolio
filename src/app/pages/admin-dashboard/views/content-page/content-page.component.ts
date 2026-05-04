import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IApiContentItem, IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { AlertModule } from '@coreui/angular';
import {
  AdminDashboardFacade,
  ContentResourceName,
} from '@core/services/admin-dashboard/admin-dashboard.facade';
import { ContentService } from '@core/services/content/content.service';
import {
  AdminContentSectionComponent,
  AdminContentSectionVariant,
} from '@pages/admin-dashboard/components/content-section/content-section.component';
import { AdminSkillsSectionComponent } from '@pages/admin-dashboard/components/skills-section/skills-section.component';

type ContentResourcePage = Exclude<ContentResourceName, 'resumes'>;

interface AdminContentPageData {
  resourceName: ContentResourcePage;
  variant: AdminContentSectionVariant;
  sectionTitle: string;
  createTitle: string;
  emptyMessage: string;
  kicker: string;
  description: string;
}

@Component({
  selector: 'app-admin-content-page',
  standalone: true,
  imports: [CommonModule, AlertModule, AdminContentSectionComponent, AdminSkillsSectionComponent],
  templateUrl: './content-page.component.html',
  styleUrl: './content-page.component.scss',
})
export class AdminContentPageComponent implements OnInit {
  config!: AdminContentPageData;
  skillPagination: IPaginationResponse<IApiTechSkill> = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  readonly skillPageSize = 6;

  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly route: ActivatedRoute,
    private readonly contentService: ContentService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.config = this.route.snapshot.data as AdminContentPageData;
    if (this.config.variant === 'skills') {
      await this.loadSkillPage();
      await this.facade.ensureContentReady();
      this.cdr.detectChanges();
      return;
    }

    await this.facade.ensureContentReady();
    this.cdr.detectChanges();
  }

  get items(): IApiContentItem[] {
    return this.facade.getContentItems(this.config.resourceName);
  }

  get draft(): Partial<IApiContentItem> {
    return this.facade.getContentDraft(this.config.resourceName);
  }

  get skillItems(): IApiTechSkill[] {
    return this.skillPagination.data;
  }

  get skillDraft(): Partial<IApiTechSkill> {
    return this.facade.getContentDraft('techSkills') as Partial<IApiTechSkill>;
  }

  async createSkill(): Promise<void> {
    await this.facade.createContentItem('techSkills');
    await this.loadSkillPage(1);
  }

  async saveSkill(skill: IApiTechSkill): Promise<void> {
    await this.facade.saveContentItem('techSkills', skill);
    await this.loadSkillPage(this.skillPagination.currentPage);
  }

  async deleteSkill(skill: IApiTechSkill): Promise<void> {
    await this.facade.deleteContentItem('techSkills', skill);

    const fallbackPage =
      this.skillPagination.data.length === 1 && this.skillPagination.currentPage > 1
        ? this.skillPagination.currentPage - 1
        : this.skillPagination.currentPage;

    await this.loadSkillPage(fallbackPage);
  }

  async changeSkillPage(page: number): Promise<void> {
    await this.loadSkillPage(page);
  }

  private async loadSkillPage(page = this.skillPagination.currentPage): Promise<void> {
    this.facade.contentLoading = true;

    try {
      this.skillPagination = await this.contentService.getTechSkillsPaginated({
        page,
        limit: this.skillPageSize,
        sortBy: 'order',
        sortOrder: 'asc',
      });
    } finally {
      this.facade.contentLoading = false;
      this.cdr.detectChanges();
    }
  }
}
