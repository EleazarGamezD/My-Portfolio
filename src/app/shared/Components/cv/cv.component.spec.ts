import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsService } from '@core/services/analytics/analytics.service';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';

import { CvComponent } from './cv.component';

describe('CvComponent', () => {
  let component: CvComponent;
  let fixture: ComponentFixture<CvComponent>;
  const contentService = {
    getResumes: vi.fn(),
    getProfile: vi.fn(),
  };

  beforeEach(async () => {
    contentService.getResumes.mockResolvedValue([]);
    contentService.getProfile.mockResolvedValue(null);
    await TestBed.configureTestingModule({
      imports: [CvComponent],
      providers: [
        { provide: ContentService, useValue: contentService },
        { provide: AnalyticsService, useValue: { trackCVDownload: vi.fn() } },
        {
          provide: I18nService,
          useValue: {
            t: (key: string) => key,
            selectText: (es: string, en: string) => es || en,
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps resumes when optional profile content fails', async () => {
    contentService.getResumes.mockResolvedValueOnce([
      { _id: 'resume-1', active: true, title: { es: 'CV', en: 'CV' } },
    ]);
    contentService.getProfile.mockRejectedValueOnce(new Error('profile unavailable'));

    await component.loadResumes();

    expect(component.resumes).toHaveLength(1);
    expect(component.error).toBeNull();
  });
});
