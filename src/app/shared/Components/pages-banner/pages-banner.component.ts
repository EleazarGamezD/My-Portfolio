import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-pages-banner',
  imports: [],
  templateUrl: './pages-banner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pages-banner.component.scss',
})
export class PagesBannerComponent {
  i18nService = inject(I18nService);

  title = input<string>('');
  breadcrumbLabel = input<string>('');
  backgroundImage = input<string>('https://placehold.co/1920x940');

  t(key: string) {
    return this.i18nService.t(key);
  }
}
