import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { AnalyticsService } from '@core/services/analytics/analytics.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { ProjectsService } from '@core/services/projects/projects.service';

@Component({
  selector: 'app-project-detail-box',
  imports: [CommonModule],
  templateUrl: './project-detail-box.component.html',
  styleUrl: './project-detail-box.component.scss',
})
export class ProjectDetailBoxComponent implements OnInit {
  project: IProject | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly projectsService: ProjectsService,
    public i18nService: I18nService,
    private analyticsService: AnalyticsService,
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

        // Track project view
        if (this.project?._id) {
          this.analyticsService.trackProjectView(this.project._id.toString());
        }
      } catch (error) {
        console.warn(`Failed to load project detail for "${projectIdOrSlug}" from API.`, error);
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

  get projectTechnologies() {
    if (!this.project) {
      return '';
    }
    return Array.isArray(this.project.stack) ? this.project.stack.join(', ') : '';
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
