import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IProject, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { AnalyticsService } from '@core/services/analytics/analytics.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { ProjectsService } from '@core/services/projects/projects.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-project-detail-box',
  imports: [CommonModule],
  templateUrl: './project-detail-box.component.html',
  styleUrl: './project-detail-box.component.scss',
})
export class ProjectDetailBoxComponent implements OnInit {
  project: IProject | undefined;
  activeImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly projectsService: ProjectsService,
    public i18nService: I18nService,
    private analyticsService: AnalyticsService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const projectIdOrSlug = params.get('id') || '';
      this.project = undefined;

      if (!projectIdOrSlug) {
        return;
      }

      try {
        this.project = await this.projectsService.getProjectByIdOrSlug(projectIdOrSlug);
        this.activeImage = this.galleryImages[0] || null;

        // Track project view
        if (this.project?._id) {
          this.analyticsService.trackProjectView(this.project._id.toString());
        }
      } catch (error) {
        console.warn(`Failed to load project detail for "${projectIdOrSlug}" from API.`, error);
      } finally {
        this.changeDetectorRef.detectChanges();
        requestTemplateReinit();
      }
    });
  }

  get projectTitle() {
    if (!this.project) {
      return '';
    }
    return this.i18nService.selectText(this.project.title?.es || '', this.project.title?.en || this.project.title?.es || '');
  }

  get projectDescription() {
    if (!this.project) {
      return '';
    }
    return this.i18nService.selectText(
      this.project.description?.es || this.project.summary?.es || '',
      this.project.description?.en || this.project.summary?.en || this.project.description?.es || '',
    );
  }

  get projectSummary() {
    if (!this.project) {
      return '';
    }

    return this.i18nService.selectText(
      this.project.summary?.es || this.project.description?.es || '',
      this.project.summary?.en || this.project.description?.en || this.project.summary?.es || '',
    );
  }

  get projectTechnologies() {
    if (!this.project) {
      return [];
    }
    return Array.isArray(this.project.skills) ? this.project.skills : [];
  }

  get projectTechnologyLabels() {
    if (this.projectTechnologies.length > 0) {
      return this.projectTechnologies.map((skill) => this.getSkillLabel(skill)).filter(Boolean);
    }

    return Array.isArray(this.project?.stack) ? this.project.stack : [];
  }

  get galleryImages() {
    if (!this.project) {
      return [];
    }

    const sources = [this.project.coverImage, ...(this.project.images || [])];
    const normalized = sources
      .map((asset) => this.resolveProjectAsset(asset))
      .filter((asset): asset is string => !!asset);

    return [...new Set(normalized)];
  }

  get heroImage() {
    return this.activeImage || this.galleryImages[0] || null;
  }

  get hasLiveDemo() {
    return !!this.project?.projectLink && this.project.projectLink.startsWith('http');
  }

  get hasSourceCode() {
    return !!this.project?.codeLink && this.project.codeLink.startsWith('http');
  }

  selectImage(image: string) {
    this.activeImage = image;
  }

  getSkillLabel(skill: IApiTechSkill): string {
    return this.i18nService.selectText(
      skill.label?.es || skill.value || '',
      skill.label?.en || skill.label?.es || skill.value || '',
    );
  }

  getSkillIcon(skill: IApiTechSkill): string | null {
    return resolveImageAssetUrl(skill.icon ?? null);
  }

  isPrimarySkill(skill: IApiTechSkill): boolean {
    return Boolean(skill._id && this.project?.primarySkill?._id === skill._id);
  }

  private resolveProjectAsset(asset?: string | IProjectAsset | null) {
    return resolveImageAssetUrl(asset);
  }

  backToHome() {
    this.router.navigateByUrl(this.i18nService.localizedPath('home'));
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
