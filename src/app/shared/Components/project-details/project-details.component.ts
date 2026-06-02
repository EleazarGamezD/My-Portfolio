import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { ProjectsService } from '@core/services/projects/projects.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { PagesBannerComponent } from '../pages-banner/pages-banner.component';
import { ProjectDetailGroupComponent } from '../project-detail-group/project-detail-group.component';


@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [PagesBannerComponent, ProjectDetailGroupComponent],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit, AfterViewInit {
  project: IProject | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly projectsService: ProjectsService,
    public readonly i18nService: I18nService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }

    this.route.paramMap
      .pipe(
        map((params) => params.get('id') || ''),
        filter((projectIdOrSlug) => typeof projectIdOrSlug === 'string'),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((projectIdOrSlug) => {
        void this.loadProject(projectIdOrSlug);
      });
  }

  ngAfterViewInit(): void {
    requestTemplateReinit();
  }

  get bannerTitle(): string {
    if (!this.project) {
      return '';
    }

    return this.i18nService.selectText(
      this.project.title?.es || '',
      this.project.title?.en || this.project.title?.es || '',
    );
  }

  get bannerBackgroundImage(): string {
    return resolveImageAssetUrl(this.project?.coverImage) || 'https://placehold.co/1920x940';
  }

  private async loadProject(projectIdOrSlug: string): Promise<void> {
    this.project = null;

    if (!projectIdOrSlug) {
      this.cdr.markForCheck();
      return;
    }

    try {
      this.project = await this.projectsService.getProjectByIdOrSlug(projectIdOrSlug);
    } catch (error) {
      console.warn(`Failed to load project detail for "${projectIdOrSlug}" from API.`, error);
    } finally {
      this.cdr.markForCheck();
      requestTemplateReinit();
    }
  }
}
