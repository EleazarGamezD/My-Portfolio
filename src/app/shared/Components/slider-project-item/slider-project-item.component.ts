import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
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
      if (typeof image === 'string' && image) {
        return image;
      }

      if (typeof image === 'object' && image?.url) {
        return image.url;
      }

      if (typeof image === 'object' && image?.base64) {
        return image.base64;
      }
    }

    if (typeof this.project.coverImage === 'string' && this.project.coverImage) {
      return this.project.coverImage;
    }

    if (typeof this.project.coverImage === 'object' && this.project.coverImage?.url) {
      return this.project.coverImage.url;
    }

    if (typeof this.project.coverImage === 'object' && this.project.coverImage?.base64) {
      return this.project.coverImage.base64;
    }

    return '/assets/images/shared/backgrounds/desktop-v3.webp';
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
