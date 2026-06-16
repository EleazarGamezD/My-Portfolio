import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IApiProfile } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { EmailService } from '@services/email/email.service';
import { RecaptchaService } from '@services/recaptcha/recaptcha.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact-me',
  imports: [ReactiveFormsModule, FormsModule],
  providers: [EmailService, RecaptchaService],
  templateUrl: './contact-me.component.html',
  styleUrl: './contact-me.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactMeComponent implements OnInit {
  private emailService = inject(EmailService);
  private fb = inject(FormBuilder);
  private recaptchaV3Service = inject(ReCaptchaV3Service);
  private recaptchaService = inject(RecaptchaService);
  private toastr = inject(ToastrService);
  private readonly contentService = inject(ContentService);
  private readonly cdr = inject(ChangeDetectorRef);
  i18nService = inject(I18nService);
  private platformId = inject(PLATFORM_ID);

  contactForm!: FormGroup;
  profile: IApiProfile | null = null;
  siteKey: string = environment.reCaptchaSiteKey;
  recaptcha: string = '';
  isBrowser: boolean;
  sendingEmail: boolean = false;
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(10),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });

    void this.loadProfile();
  }

  async onSubmit() {
    //first we get the token from the reCaptchaV3Service
    //then we add the token to the form data
    //then we send the form data to the email service only if the form is valid
    //if the token is not verified, we log the error

    //if the form is not valid, we return
    if (!this.contactForm.valid) {
      this.toastr.error(
        this.t('toast.error.invalidForm'),
        this.t('toast.error.title'),
        {
          timeOut: 3000,
        },
      );
      this.cdr.markForCheck();
    } else {
      this.sendingEmail = true;
      this.cdr.markForCheck();
      try {
        // 1. get token from reCaptcha
        const token = (await this.recaptchaV3Service
          .execute('contact')
          .toPromise()) as string;

        // 2. check token from reCaptcha is valid and has a score >= 0.5
        const verification = await this.recaptchaService.verifyToken(token);

        if (verification.success && verification.score >= 0.5) {
          // 3. send email with form data if reCAPTCHA is valid
          const formData = {
            subject: this.contactForm.value.subject,
            name: this.contactForm.value.name,
            contactEmail: this.contactForm.value.email,
            phone: this.contactForm.value.phone,
            message: this.contactForm.value.message,
          };

          const emailSent = await this.emailService.sendEmail(formData);
          if (emailSent) {
            this.contactForm.reset();
            this.toastr.success(
              this.t('toast.success.sent'),
              this.t('toast.success.title'),
              {
                timeOut: 3000,
              },
            );
          }
        } else {
          this.toastr.error(
            this.t('toast.error.recaptcha'),
            this.t('toast.error.title'),
            {
              timeOut: 3000,
            },
          );
        }
      } catch {
        this.toastr.error(
          this.t('toast.error.process'),
          this.t('toast.error.title'),
          {
            timeOut: 3000,
          },
        );
      } finally {
        this.sendingEmail = false;
        this.cdr.markForCheck();
      }
    }
  }

  t(key: string) {
    return this.i18nService.t(key);
  }

  get sectionBackgroundImage() {
    if (
      this.profile?.metadata?.portfolioMedia
        ?.contactSectionTransparentBackground
    ) {
      return 'none';
    }

    const backgroundUrl =
      resolveImageAssetUrl(
        this.profile?.metadata?.portfolioMedia?.contactSectionBackground,
      ) || 'https://placehold.co/1920x1200';
    return backgroundUrl ? `url('${backgroundUrl}')` : 'none';
  }

  private async loadProfile(): Promise<void> {
    try {
      this.profile = await this.contentService.getProfile();
    } catch (error) {
      console.warn(
        'Failed to load profile content for contact section.',
        error,
      );
    } finally {
      this.cdr.markForCheck();
    }
  }
}
