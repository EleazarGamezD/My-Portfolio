import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { ProjectDetailBoxComponent } from '../project-detail-box/project-detail-box.component';

@Component({
  selector: 'app-project-detail-group',
  imports: [ProjectDetailBoxComponent],
  templateUrl: './project-detail-group.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project-detail-group.component.scss',
})
export class ProjectDetailGroupComponent {
  @Input() project: IProject | null = null;
}
