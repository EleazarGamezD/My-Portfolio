import { Component, OnInit } from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-career-path',
  imports: [],
  templateUrl: './career-path.component.html',
  styleUrl: './career-path.component.scss',
})
export class CareerPathComponent implements OnInit {
  careerPathArray: IApiContentItem[] = [];
  Icons = SideIcons;

  constructor(
    public i18nService: I18nService,
    private readonly contentService: ContentService,
  ) {}

  async ngOnInit() {
    try {
      this.careerPathArray = await this.contentService.getExperience();
    } catch (error) {
      console.warn('Failed to load experience from API.', error);
    }
  }

  getTitle(item: IApiContentItem) {
    return this.i18nService.selectText(
      item.label?.es ?? item.value ?? '',
      item.label?.en ?? item.label?.es ?? item.value ?? '',
    );
  }

  getDescription(item: IApiContentItem) {
    return this.i18nService.selectText(
      item.description?.es ?? '',
      item.description?.en ?? item.description?.es ?? '',
    );
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
