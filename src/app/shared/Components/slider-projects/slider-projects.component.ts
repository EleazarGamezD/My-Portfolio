import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import {IProject} from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { ProjectsService } from '@services/projects/projects.service';
import {SliderProjectItemComponent} from "../slider-project-item/slider-project-item.component";
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-slider-projects',
  imports: [SliderProjectItemComponent],
  templateUrl: './slider-projects.component.html',
  styleUrl: './slider-projects.component.scss'
})
export class SliderProjectsComponent implements OnInit {
  constructor(
    public i18nService: I18nService,
    private projectsService: ProjectsService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  Icons = SideIcons
  ProjectsArray: IProject[] = []
  isLoading = true

  async ngOnInit() {
    try {
      this.ProjectsArray = await this.projectsService.getProjects();
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
}
