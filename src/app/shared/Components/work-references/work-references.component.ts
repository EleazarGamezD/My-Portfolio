import { Component, OnInit } from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-work-references',
  imports: [],
  templateUrl: './work-references.component.html',
  styleUrl: './work-references.component.scss'
})
export class WorkReferencesComponent implements OnInit {
  Icons = SideIcons;
  workReferences: IApiContentItem[] = [];
  downSideIcons: {url: string}[] = [];

  constructor(
    public i18nService: I18nService,
    private readonly contentService: ContentService,
  ) {}

  async ngOnInit() {
    try {
      this.workReferences = await this.contentService.getTestimonials();
    } catch (error) {
      console.warn('Failed to load testimonials from API.', error);
    }
  }

  getTestimonial(item: IApiContentItem) {
    return this.i18nService.selectText(
      item.description?.es ?? '',
      item.description?.en ?? item.description?.es ?? '',
    );
  }

  getMetadataText(item: IApiContentItem, key: string) {
    const value = item.metadata?.[key];
    return typeof value === 'string' ? value : '';
  }

  getName(item: IApiContentItem) {
    return this.getMetadataText(item, 'name') || this.i18nService.selectText(
      item.label?.es ?? '',
      item.label?.en ?? item.label?.es ?? '',
    );
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
