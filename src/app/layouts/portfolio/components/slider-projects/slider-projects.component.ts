import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { IApiProfile } from '@core/interfaces/content/content.interface';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';
import { ProjectsService } from '@services/projects/projects.service';
import { SliderProjectItemComponent } from '../slider-project-item/slider-project-item.component';

@Component({
  selector: 'app-slider-projects',
  imports: [SliderProjectItemComponent],
  templateUrl: './slider-projects.component.html',
  styleUrl: './slider-projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderProjectsComponent implements OnInit {
  i18nService = inject(I18nService);
  private projectsService = inject(ProjectsService);
  private readonly contentService = inject(ContentService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  profile: IApiProfile | null = null;

  ProjectsArray: IProject[] = [];
  isLoading = true;

  async ngOnInit() {
    try {
      const [projects, profile] = await Promise.all([
        this.projectsService.getProjects(),
        this.contentService.getProfile(),
      ]);
      this.ProjectsArray = projects;
      this.profile = profile;
    } catch (error) {
      console.error('Failed to load projects from API.', error);
      this.ProjectsArray = [];
    } finally {
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
      requestTemplateReinit();
    }
  }

  t(key: string) {
    return this.i18nService.t(key);
  }

  get multitaskIcon() {
    return (
      resolveImageAssetUrl(
        this.profile?.metadata?.portfolioMedia?.decorativeMultitaskIcon,
      ) || createPortfolioPlaceholder('Multitask Icon', 360, 360)
    );
  }

  get apiIcon() {
    return (
      resolveImageAssetUrl(
        this.profile?.metadata?.portfolioMedia?.decorativeApiIcon,
      ) || createPortfolioPlaceholder('API Icon', 360, 360)
    );
  }

  get sectionBackgroundImage() {
    if (
      this.profile?.metadata?.portfolioMedia
        ?.projectsSectionTransparentBackground
    ) {
      return 'none';
    }

    const backgroundUrl =
      resolveImageAssetUrl(
        this.profile?.metadata?.portfolioMedia?.projectsSectionBackground,
      ) || 'https://placehold.co/1920x1200';
    return backgroundUrl ? `url('${backgroundUrl}')` : 'none';
  }

  trackProject(index: number, project: IProject): string {
    return (
      project._id ||
      project.slug ||
      project.title?.es ||
      project.title?.en ||
      `${index}`
    );
  }
}
