import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { IApiProfile } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-contact-me-hello',
  standalone: true,
  imports: [],
  templateUrl: './contact-me-hello.component.html',
  styleUrl: './contact-me-hello.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactMeHelloComponent implements OnInit {
  i18nService = inject(I18nService);
  private readonly contentService = inject(ContentService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  profile: IApiProfile | null = null;
  private readonly legacySingleTitles = new Set([
    '¡Di hola!',
    'Di hola!',
    'Say hello!',
  ]);

  async ngOnInit() {
    try {
      this.profile = await this.contentService.getProfile();
    } catch (error) {
      console.warn('Failed to load contact intro content.', error);
    } finally {
      this.changeDetectorRef.detectChanges();
      requestTemplateReinit();
    }
  }

  get contactIntroText(): string {
    if (!this.profile?.metadata?.contactIntro) {
      return this.t('home.contactHello.body');
    }

    return (
      this.i18nService.selectText(
        this.profile.metadata.contactIntro.es ?? '',
        this.profile.metadata.contactIntro.en ??
          this.profile.metadata.contactIntro.es ??
          '',
      ) || this.t('home.contactHello.body')
    );
  }

  get contactIntroTitle(): string {
    if (!this.profile?.metadata?.contactIntroTitle) {
      return this.t('home.contactHello.title');
    }

    return (
      this.i18nService.selectText(
        this.profile.metadata.contactIntroTitle.es ?? '',
        this.profile.metadata.contactIntroTitle.en ??
          this.profile.metadata.contactIntroTitle.es ??
          '',
      ) || this.t('home.contactHello.title')
    );
  }

  get contactIntroTitleFancyConfig(): string {
    const titles = this.contactIntroTitle
      .split(',')
      .map((title) => title.trim())
      .filter(Boolean);
    const fallbackTitles = this.t('home.contactHello.title')
      .split(',')
      .map((title) => title.trim())
      .filter(Boolean);
    const shouldUseFallbackList =
      titles.length === 1 && this.legacySingleTitles.has(titles[0]);

    return JSON.stringify({
      effect: 'rotate',
      string: shouldUseFallbackList || !titles.length ? fallbackTitles : titles,
    });
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
