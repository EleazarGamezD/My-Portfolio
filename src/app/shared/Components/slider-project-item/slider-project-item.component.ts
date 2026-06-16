import {
  Component,
  Input,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IProject,
  IProjectAsset,
} from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';

@Component({
  selector: 'app-slider-project-item',
  imports: [],
  templateUrl: './slider-project-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './slider-project-item.component.scss',
})
export class SliderProjectItemComponent {
  private router = inject(Router);
  private i18nService = inject(I18nService);

  @Input() project: IProject = {} as IProject;
  @Input() projectIndex = 0;

  navigateToProject() {
    const identifier =
      this.project.slug || this.project._id || String(this.projectIndex + 1);
    this.router.navigateByUrl(
      this.i18nService.localizedPath(`projectDetails/${identifier}`),
    );
  }

  get title() {
    return this.i18nService.selectText(
      this.project.title?.es || '',
      this.project.title?.en || this.project.title?.es || '',
    );
  }

  get isFeatured() {
    return Boolean(this.project.featured);
  }

  get previewImage() {
    const coverImage = this.resolveProjectAsset(this.project.coverImage);
    if (coverImage) {
      return coverImage;
    }

    const rawImages = Array.isArray(this.project.images)
      ? this.project.images
      : [];

    for (const image of rawImages) {
      const resolvedImage = this.resolveProjectAsset(image);
      if (resolvedImage) {
        return resolvedImage;
      }
    }

    return createPortfolioPlaceholder('Project Cover', 1200, 900);
  }

  get summary() {
    return this.i18nService.selectText(
      this.project.summary?.es || this.project.description?.es || '',
      this.project.summary?.en ||
        this.project.description?.en ||
        this.project.summary?.es ||
        '',
    );
  }

  get stackPreview() {
    return Array.isArray(this.project.stack)
      ? this.project.stack.slice(0, 3)
      : [];
  }

  get stackCountRemainder() {
    return Array.isArray(this.project.stack) && this.project.stack.length > 3
      ? this.project.stack.length - 3
      : 0;
  }

  get hasGitHubStats() {
    return Boolean(this.project.githubStats);
  }

  formatCount(value?: number) {
    const amount = Number(value ?? 0);
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
    }

    return String(amount);
  }

  private resolveProjectAsset(asset?: string | IProjectAsset | null) {
    return resolveImageAssetUrl(asset);
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
