import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-scroll-indicator',
  imports: [],
  templateUrl: './scroll-indicator.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './scroll-indicator.component.scss',
})
export class ScrollIndicatorComponent {
  i18nService = inject(I18nService);

  t(key: string) {
    return this.i18nService.t(key);
  }
}
