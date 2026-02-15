import { Component } from '@angular/core';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-small-about-resume',
  imports: [],
  templateUrl: './small-about-resume.component.html',
  styleUrl: './small-about-resume.component.scss'
})
export class SmallAboutResumeComponent {
  constructor(public i18nService: I18nService) {}

  t(key: string) {
    return this.i18nService.t(key);
  }
}
