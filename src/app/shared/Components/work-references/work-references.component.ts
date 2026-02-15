import {Component} from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import { I18nService } from '@core/services/i18n/i18n.service';
import {IWorkReferences} from '@core/interfaces/work-references/work-references.interface';
import {references} from '@shared/Json/workReferences';

@Component({
  selector: 'app-work-references',
  imports: [],
  templateUrl: './work-references.component.html',
  styleUrl: './work-references.component.scss'
})
export class WorkReferencesComponent {
  constructor(public i18nService: I18nService) {}

  Icons = SideIcons
  workReferences: IWorkReferences[] = references
  downSideIcons: {url: string}[] = []

  getTestimonial(item: IWorkReferences) {
    return this.i18nService.selectText(item.testimonialEs, item.testimonialEn);
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
