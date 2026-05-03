import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent implements OnInit {
  stack: IApiContentItem[] = [];

  constructor(
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    try {
      this.stack = await this.contentService.getTechSkills();
    } catch (error) {
      console.warn('Failed to load tech skills from API.', error);
    } finally {
      this.changeDetectorRef.detectChanges();
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
}
