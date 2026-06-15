
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiProfile, IApiResume } from '@core/interfaces/content/content.interface';
import { API_CONTENT_ROUTES } from '@core/routes/content/content.routes';
import { AnalyticsService } from '@core/services/analytics/analytics.service';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

const CV_CONTENT_TIMEOUT_MS = 12000;

@Component({
  selector: 'app-cv',
  imports: [],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvComponent implements OnInit {
  resumes: IApiResume[] = [];
  profile: IApiProfile | null = null;
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
      const [resumes, profile] = await this.withTimeout(
        Promise.all([
          this.contentService.getResumes(),
          this.contentService.getProfile(),
        ]),
      );
      this.resumes = Array.isArray(resumes)
        ? resumes.filter((resume) => resume.active !== false)
        : [];
      this.profile = profile;
    } catch (err) {
      console.error('Error loading resumes:', err);
      this.error = this.t('cv.loadError');
      this.resumes = [];
    } finally {
      this.loading = false;
      this.changeDetectorRef.detectChanges();
      requestTemplateReinit();
    }
  }

  downloadCV(resume: IApiResume): void {
    const fileName = this.getResumeDownloadFileName(resume);
    this.analyticsService.trackCVDownload(fileName);
    const resumeLanguage = this.resolveResumeLanguage(resume);
    const generatedUrl = API_CONTENT_ROUTES.generateCvPdf(resumeLanguage);

    const generatedLink = document.createElement('a');
    generatedLink.href = generatedUrl;
    generatedLink.target = '_blank';
    generatedLink.rel = 'noopener noreferrer';
    generatedLink.download = fileName;
    document.body.appendChild(generatedLink);
    generatedLink.click();
    document.body.removeChild(generatedLink);
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
    const language = this.resolveResumeLanguage(resume);
    const fullName = this.i18nService.selectText(
      this.profile?.label?.es ?? this.profile?.title?.es ?? '',
      this.profile?.label?.en ?? this.profile?.title?.en ?? this.profile?.label?.es ?? this.profile?.title?.es ?? '',
    );
    const normalizedName = fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const [firstName = 'portfolio', ...rest] = normalizedName.split(' ');
    const lastName = rest.at(-1) || 'owner';

    return `${firstName}_${lastName}_${language}_cv.pdf`;
  }

  canDownloadCV(resume: IApiResume): boolean {
    return Boolean(this.resolveResumeLanguage(resume));
  }

  private resolveResumeLanguage(resume: IApiResume): 'es' | 'en' {
    const rawLanguage = typeof resume.metadata?.['language'] === 'string'
      ? resume.metadata['language']
      : resume.language || '';
    const normalizedLanguage = rawLanguage.trim().toLowerCase();

    if (normalizedLanguage === 'en') {
      return 'en';
    }

    if (normalizedLanguage === 'es') {
      return 'es';
    }

    const identity = `${resume.slug || ''} ${resume.fileName || ''} ${resume.title?.en || ''}`.toLowerCase();
    return identity.includes('en') ? 'en' : 'es';
  }

  t(key: string) {
    return this.i18nService.t(key);
  }

  get cvHeroBackground() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.cvHeroBackground) ||
      createPortfolioPlaceholder('CV Hero', 1600, 900)
    );
  }

  get cvSectionBackground() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.cvSectionBackground) ||
      createPortfolioPlaceholder('CV Section', 1600, 900)
    );
  }

  get cloudIcon() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.decorativeCloudIcon) ||
      createPortfolioPlaceholder('Cloud Icon', 420, 420)
    );
  }

  get webDevelopmentIcon() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.decorativeWebDevelopmentIcon) ||
      createPortfolioPlaceholder('Web Dev Icon', 420, 420)
    );
  }

  trackResume(index: number, resume: IApiResume): string {
    return resume._id || resume.slug || resume.fileName || resume.title?.es || resume.title?.en || `${index}`;
  }

  private async withTimeout<T>(operation: Promise<T>): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('CV content request timed out')), CV_CONTENT_TIMEOUT_MS);
    });

    try {
      return await Promise.race([operation, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
