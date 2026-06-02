import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IProject, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { AnalyticsService } from '@core/services/analytics/analytics.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';

@Component({
  selector: 'app-project-detail-box',
  imports: [CommonModule],
  templateUrl: './project-detail-box.component.html',
  styleUrl: './project-detail-box.component.scss',
})
export class ProjectDetailBoxComponent implements OnChanges {
  @Input() project: IProject | null = null;
  activeImage: string | null = null;
  private lastTrackedProjectId: string | null = null;

  constructor(
    private router: Router,
    public i18nService: I18nService,
    private analyticsService: AnalyticsService,
  ) { }

  ngOnChanges(): void {
    this.activeImage = this.galleryImages[0] || null;

    if (this.project?._id && this.lastTrackedProjectId !== this.project._id) {
      this.analyticsService.trackProjectView(this.project._id.toString());
      this.lastTrackedProjectId = this.project._id;
    }
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
      this.project.description?.en || this.project.description?.es || this.project.summary?.en || this.project.summary?.es || '',
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

  get isFeatured() {
    return Boolean(this.project?.featured);
  }

  get detailBackgroundImage() {
    return this.heroImage || null;
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
