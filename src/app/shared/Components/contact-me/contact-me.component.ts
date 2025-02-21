import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmailService } from '@services/email/email.service';
import { NgxCaptchaModule, ReCaptchaV3Service } from 'ngx-captcha';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contact-me',
  imports: [NgxCaptchaModule, ReactiveFormsModule, FormsModule],
  providers: [EmailService],
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
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      subject: ['', Validators.required],
      comment: ['', Validators.required],
      reCaptcha: ['', Validators.required],
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

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      console.log(formData);
    }
  }
}
