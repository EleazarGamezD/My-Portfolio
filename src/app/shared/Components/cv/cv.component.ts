import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SideIcons } from '@core/constants/sideIcons';
import { IApiResume } from '@core/interfaces/content/content.interface';
import { AnalyticsService } from '@core/services/analytics/analytics.service';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-cv',
  imports: [CommonModule],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss',
})
export class CvComponent implements OnInit {
  Icons = SideIcons
  resumes: IApiResume[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    public i18nService: I18nService,
    private contentService: ContentService,
    private analyticsService: AnalyticsService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadResumes();
  }

  async loadResumes(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      const resumes = await this.contentService.getResumes();
      this.resumes = Array.isArray(resumes)
        ? resumes.filter((resume) => resume.active !== false)
        : [];
    } catch (err) {
      console.error('Error loading resumes:', err);
      this.error = 'Error loading resumes';
      this.resumes = [];
    } finally {
      this.loading = false;
      this.changeDetectorRef.detectChanges();
      requestTemplateReinit();
    }
  }

  downloadCV(resume: IApiResume): void {
    if (!resume.base64) {
      return;
    }

    const fileName = this.getResumeDownloadFileName(resume);
    const mimeType = resume.mimeType || 'application/pdf';
    const filePath = `data:${mimeType};base64,${resume.base64}`;

    this.analyticsService.trackCVDownload(fileName);

    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.click();
  }

  getResumeTitle(resume: IApiResume) {
    return this.i18nService.selectText(
      resume.title?.es ?? resume.label?.es ?? '',
      resume.title?.en ?? resume.label?.en ?? resume.title?.es ?? resume.label?.es ?? '',
    );
  }

  getResumeDescription(resume: IApiResume) {
    return this.i18nService.selectText(
      resume.description?.es ?? '',
      resume.description?.en ?? resume.description?.es ?? '',
    );
  }

  private getResumeDownloadFileName(resume: IApiResume): string {
    const baseName = this.getResumeTitle(resume)
      .trim()
      .replace(/[\\/:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const extension = this.getResumeFileExtension(resume);
    return `${baseName || 'resume'}.${extension}`;
  }

  private getResumeFileExtension(resume: IApiResume): string {
    const fileName = resume.fileName?.trim() || '';
    const extensionMatch = fileName.match(/\.([a-z0-9]+)$/i);

    if (extensionMatch?.[1]) {
      return extensionMatch[1].toLowerCase();
    }

    switch (resume.mimeType) {
      case 'application/msword':
        return 'doc';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'docx';
      case 'application/pdf':
      default:
        return 'pdf';
    }
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
