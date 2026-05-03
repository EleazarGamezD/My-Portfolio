import {AfterViewInit, Component, OnInit} from '@angular/core';
import {PagesBannerComponent} from '../../shared/Components/pages-banner/pages-banner.component';
import {ProjectDetailGroupComponent} from '../../shared/Components/project-detail-group/project-detail-group.component';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-project-details',
  standalone: true, // Asegúrate de que sea standalone
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
