import { Component } from '@angular/core';
import { PagesBannerComponent } from '../../shared/Components/pages-banner/pages-banner.component';
import { ProjectDetailGroupComponent } from '../../shared/Components/project-detail-group/project-detail-group.component';

@Component({
  selector: 'app-project-details',
  imports: [PagesBannerComponent, ProjectDetailGroupComponent],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
})
export class ProjectDetailsComponent {}
