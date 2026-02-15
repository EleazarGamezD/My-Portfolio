import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { projects } from '@shared/Json/projects';

@Component({
  selector: 'app-project-detail-box',
  imports: [],
  templateUrl: './project-detail-box.component.html',
  styleUrl: './project-detail-box.component.scss',
})
export class ProjectDetailBoxComponent {
  project: IProject | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public i18nService: I18nService,
  ) {
    this.route.paramMap.subscribe((params) => {
      const projectId = Number(params.get('id'));
      this.project = projects.find((item) => item.id === projectId);
    });
  }

  get projectTitle() {
    if (!this.project) {
      return '';
    }
    return this.i18nService.selectText(this.project.titleEs, this.project.titleEn);
  }

  get projectDescription() {
    if (!this.project) {
      return '';
    }
    return this.i18nService.selectText(this.project.descriptionEs, this.project.descriptionEn);
  }

  get projectTechnologies() {
    if (!this.project) {
      return '';
    }
    return this.i18nService.selectText(this.project.technologiesEs, this.project.technologiesEn);
  }

  get hasLiveDemo() {
    return !!this.project?.projectLink && this.project.projectLink.startsWith('http');
  }

  backToHome() {
    this.router.navigateByUrl(this.i18nService.localizedPath('home'));
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
