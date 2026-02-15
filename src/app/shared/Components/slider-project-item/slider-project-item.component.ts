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

  constructor(
    private router: Router,
    private i18nService: I18nService,
  ) { }

  navigateToProject() {
    this.router.navigateByUrl(this.i18nService.localizedPath(`projectDetails/${this.project.id}`));
  }

  get title() {
    return this.i18nService.selectText(this.project.titleEs, this.project.titleEn);
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
