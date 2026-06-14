import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiProfile } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-contact-me-hello',
  standalone: true,
  imports: [],
  templateUrl: './contact-me-hello.component.html',
  styleUrl: './contact-me-hello.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactMeHelloComponent implements OnInit {
  profile: IApiProfile | null = null;

  constructor(
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    try {
      this.profile = await this.contentService.getProfile();
    } catch (error) {
      console.warn('Failed to load profile content for contact intro.', error);
    } finally {
      this.changeDetectorRef.detectChanges();
    }
  }

  get contactIntroText(): string {
    if (!this.profile) {
      return '';
    }

    const contactIntro = this.i18nService.selectText(
      this.profile.metadata?.contactIntro?.es ?? '',
      this.profile.metadata?.contactIntro?.en ?? this.profile.metadata?.contactIntro?.es ?? '',
    );

    if (contactIntro.trim()) {
      return contactIntro;
    }

    if (this.profile.availability?.trim()) {
      return this.profile.availability;
    }

    return this.i18nService.selectText(
      this.profile.description?.es ?? '',
      this.profile.description?.en ?? this.profile.description?.es ?? '',
    );
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
