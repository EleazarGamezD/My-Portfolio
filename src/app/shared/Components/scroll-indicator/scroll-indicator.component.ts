import { Component } from '@angular/core';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-scroll-indicator',
  imports: [],
  templateUrl: './scroll-indicator.component.html',
  styleUrl: './scroll-indicator.component.scss'
})
export class ScrollIndicatorComponent {
  constructor(public i18nService: I18nService) {}

  t(key: string) {
    return this.i18nService.t(key);
  }
}
