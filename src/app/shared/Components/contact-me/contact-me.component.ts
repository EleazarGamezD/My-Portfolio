import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ISendEmail } from '@core/interfaces/email/email.interface';
import { EmailService } from '@services/email/email.service';
import { RecaptchaService } from '@services/recaptcha/recaptcha.service';
import { NgxCaptchaModule, ReCaptchaV3Service } from 'ngx-captcha';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contact-me',
  imports: [NgxCaptchaModule, ReactiveFormsModule, FormsModule],
  providers: [EmailService, RecaptchaService],
  templateUrl: './contact-me.component.html',
  styleUrl: './contact-me.component.scss',
})
export class ContactMeComponent implements OnInit {
  contactForm!: FormGroup;
  siteKey: string = environment.reCaptchaSiteKey;
  recaptcha: string = '';
  isBrowser: boolean;

  constructor(
    private emailService: EmailService,
    private fb: FormBuilder,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private recaptchaService: RecaptchaService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
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
      reCaptcha: [''],
    });

    if (this.isBrowser) {
      this.reCaptchaV3Service.execute(
        this.siteKey,
        'homepage',
        (token) => {
          console.log('This is your token: ', token);
        },
        {
          useGlobalDomain: false,
        },
      );
    }
  }

  handleReset(): void {
    this.recaptcha = '';
  }

  handleReady(): void {
    console.log('reCAPTCHA ready');
  }

  handleLoad(): void {
    console.log('reCAPTCHA loaded');
  }

  handleSuccess(token: string): void {
    this.recaptcha = token;
    this.contactForm.patchValue({ reCaptcha: token });
  }

  async onSubmit() {
    console.log(this.contactForm.valid);
    console.log(this.contactForm.value.reCaptcha);
    if (this.contactForm.valid) {
      const formData: ISendEmail = {
        subject: this.contactForm.value.subject,
        name: this.contactForm.value.name,
        contactEmail: this.contactForm.value.email,
        message: this.contactForm.value.message,
      };
      this.reCaptchaV3Service.execute(
        this.siteKey,
        'homepage',
        async (token) => {
          const captchaTokenVerify =
            await this.recaptchaService.verifyToken(token);
          console.log('This is your token: ', token);
          console.log('This is your captchaTokenVerify: ', captchaTokenVerify);
          if (captchaTokenVerify) {
            const emailSent = this.emailService.sendEmail(formData);
            console.log('This is your emailSent: ', emailSent);
          }
        },
      );

      console.log(formData);
    }
  }
}
