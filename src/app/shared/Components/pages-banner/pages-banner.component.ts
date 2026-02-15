import { Component } from '@angular/core';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-pages-banner',
  imports: [],
  templateUrl: './pages-banner.component.html',
  styleUrl: './pages-banner.component.scss'
})
export class PagesBannerComponent {
  constructor(public i18nService: I18nService) {}

  t(key: string) {
    return this.i18nService.t(key);
  }
}
