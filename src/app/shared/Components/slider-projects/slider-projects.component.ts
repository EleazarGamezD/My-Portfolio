import {Component} from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import {IProject} from '@core/interfaces/projects/projects.interfaces';
import {projects} from '@shared/Json/projects';
import {SliderProjectItemComponent} from "../slider-project-item/slider-project-item.component";

@Component({
  selector: 'app-slider-projects',
  imports: [SliderProjectItemComponent],
  templateUrl: './slider-projects.component.html',
  styleUrl: './slider-projects.component.scss'
})
export class SliderProjectsComponent {
  Icons = SideIcons
  ProjectsArray: IProject[] = projects
}
