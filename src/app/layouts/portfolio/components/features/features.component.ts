import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesComponent implements OnInit {
  i18nService = inject(I18nService);
  private readonly contentService = inject(ContentService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  stack: IApiContentItem[] = [];

  async ngOnInit() {
    try {
      this.stack = await this.contentService.getTechSkills();
    } catch (error) {
      console.warn('Failed to load tech skills from API.', error);
    } finally {
      this.changeDetectorRef.markForCheck();
      requestTemplateReinit();
    }
  }

  t(key: string) {
    return this.i18nService.t(key);
  }

  getItemLabel(item: IApiContentItem) {
    return this.i18nService.selectText(
      item.label?.es ?? item.value ?? '',
      item.label?.en ?? item.label?.es ?? item.value ?? '',
    );
  }

  getItemIconUrl(item: IApiContentItem): string | null {
    return resolveImageAssetUrl(item.icon ?? null);
  }

  trackStackItem(_: number, item: IApiContentItem): string {
    return item.slug || item.value || `${_}`;
  }
}
