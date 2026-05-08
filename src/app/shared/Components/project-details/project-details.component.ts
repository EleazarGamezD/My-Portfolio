import { AfterViewInit, Component, OnInit } from '@angular/core';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';
import { PagesBannerComponent } from '../pages-banner/pages-banner.component';
import { ProjectDetailGroupComponent } from '../project-detail-group/project-detail-group.component';


@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [PagesBannerComponent, ProjectDetailGroupComponent],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
})
export class ProjectDetailsComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
  }

  ngAfterViewInit(): void {
    requestTemplateReinit();
  }
}
