import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SideIcons } from '@core/constants/sideIcons';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { AnalyticsService } from '@core/services/analytics/analytics.service';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-cv',
  imports: [CommonModule],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss',
})
export class CvComponent implements OnInit {
  Icons = SideIcons
  resumes: IApiContentItem[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    public i18nService: I18nService,
    private contentService: ContentService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
    this.loadResumes();
  }

  async loadResumes(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.resumes = await this.contentService.getResumes();
    } catch (err) {
      console.error('Error loading resumes:', err);
      this.error = 'Error loading resumes';
    } finally {
      this.loading = false;
    }
  }

  downloadCV(filename: string): void {
    // Track the download
    this.analyticsService.trackCVDownload(filename);

    // Trigger download
    const filePath = `assets/docs/${filename}`;
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filename;
    link.click();
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
