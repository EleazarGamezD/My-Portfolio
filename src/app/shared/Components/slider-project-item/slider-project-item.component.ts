import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IProject, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';

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

    return '/assets/images/shared/backgrounds/desktop-v3.webp';
  }

  private resolveProjectAsset(asset?: string | IProjectAsset | null) {
    if (!asset) {
      return null;
    }

    if (typeof asset === 'string') {
      return asset;
    }

    if (asset.url) {
      return asset.url;
    }

    if (asset.base64 && asset.mimeType) {
      return `data:${asset.mimeType};base64,${asset.base64}`;
    }

    if (asset.base64) {
      return asset.base64.startsWith('data:') ? asset.base64 : `data:image/webp;base64,${asset.base64}`;
    }

    return null;
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
