import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IProject, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';

@Component({
  selector: 'app-slider-project-item',
  imports: [],
  templateUrl: './slider-project-item.component.html',
  styleUrl: './slider-project-item.component.scss'
})
export class SliderProjectItemComponent {
  @Input() project: IProject = {} as IProject;
  @Input() projectIndex = 0;

  constructor(
    private router: Router,
    private i18nService: I18nService,
  ) { }

  navigateToProject() {
    const identifier = this.project.slug || this.project._id || String(this.projectIndex + 1);
    this.router.navigateByUrl(this.i18nService.localizedPath(`projectDetails/${identifier}`));
  }

  get title() {
    return this.i18nService.selectText(this.project.title?.es || '', this.project.title?.en || this.project.title?.es || '');
  }

  get previewImage() {
    const rawImages = Array.isArray(this.project.images) ? this.project.images : [];

    for (const image of rawImages) {
      const resolvedImage = this.resolveProjectAsset(image);
      if (resolvedImage) {
        return resolvedImage;
      }
    }

    const coverImage = this.resolveProjectAsset(this.project.coverImage);
    if (coverImage) {
      return coverImage;
    }

    return createPortfolioPlaceholder('Project Cover', 1200, 900);
  }

  get summary() {
    return this.i18nService.selectText(
      this.project.summary?.es || this.project.description?.es || '',
      this.project.summary?.en || this.project.description?.en || this.project.summary?.es || '',
    );
  }

  get stackPreview() {
    return Array.isArray(this.project.stack) ? this.project.stack.slice(0, 3) : [];
  }

  get stackCountRemainder() {
    return Array.isArray(this.project.stack) && this.project.stack.length > 3 ? this.project.stack.length - 3 : 0;
  }

  private resolveProjectAsset(asset?: string | IProjectAsset | null) {
    return resolveImageAssetUrl(asset);
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
