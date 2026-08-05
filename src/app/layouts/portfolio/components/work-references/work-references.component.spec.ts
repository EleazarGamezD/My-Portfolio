import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';

import { WorkReferencesComponent } from './work-references.component';

describe('WorkReferencesComponent', () => {
  let component: WorkReferencesComponent;
  let fixture: ComponentFixture<WorkReferencesComponent>;
  const contentService = {
    getTestimonials: vi.fn(),
    getProfile: vi.fn(),
  };

  beforeEach(async () => {
    contentService.getTestimonials.mockResolvedValue([]);
    contentService.getProfile.mockResolvedValue(null);
    await TestBed.configureTestingModule({
      imports: [WorkReferencesComponent],
      providers: [
        { provide: ContentService, useValue: contentService },
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

    fixture = TestBed.createComponent(WorkReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps testimonials when optional profile content fails', async () => {
    contentService.getTestimonials.mockResolvedValueOnce([
      { _id: 'testimonial-1', description: { es: 'Excelente', en: 'Great' } },
    ]);
    contentService.getProfile.mockRejectedValueOnce(new Error('profile unavailable'));

    await component.ngOnInit();

    expect(component.workReferences).toHaveLength(1);
    expect(component.error).toBeNull();
  });
});
