import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {IProject} from '@core/interfaces/projects/projects.interfaces';

@Component({
  selector: 'app-slider-project-item',
  imports: [],
  templateUrl: './slider-project-item.component.html',
  styleUrl: './slider-project-item.component.scss'
})
export class SliderProjectItemComponent {
  @Input() project: IProject = {} as IProject
  constructor(
    private router: Router
  ) { }

  navigateToProject() {
    this.router.navigate([`projectDetails/${this.project.id}`])
  }
}
