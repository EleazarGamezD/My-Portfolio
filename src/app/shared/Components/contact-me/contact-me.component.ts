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
import { IRecaptchaVerifyResponse } from '@core/interfaces/recaptcha/recaptchat.interface';
import { EmailService } from '@services/email/email.service';
import { RecaptchaService } from '@services/recaptcha/recaptcha.service';
import { NgRecaptcha3Service } from 'ng-recaptcha3';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contact-me',
  imports: [ReactiveFormsModule, FormsModule],
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
    private reCaptchaV3Service: NgRecaptcha3Service,
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
      reCaptchaToken: [Boolean, Validators.required],
    });
    if (this.isBrowser) {
      this.reCaptchaV3Service.init(this.siteKey);
    }
  }

  async onSubmit() {
    //first we get the token from the reCaptchaV3Service
    //then we add the token to the form data
    //then we send the form data to the email service only if the form is valid
    let verifyToken: IRecaptchaVerifyResponse = { success: false };

    this.reCaptchaV3Service
      .getToken({ action: 'contact' })
      .then(
        async (token) => {
          verifyToken = await this.recaptchaService.verifyToken(token);
          this.contactForm.value.reCaptchaToken = verifyToken.success;
        },
        (error) => {
          this.contactForm.value.reCaptchaToken = false;
          console.log('cant get token: ', error);
        },
      )
      .then(async () => {
        console.log(this.contactForm.valid && verifyToken.success);
        if (this.contactForm.valid) {
          const formData: ISendEmail = {
            subject: this.contactForm.value.subject,
            name: this.contactForm.value.name,
            contactEmail: this.contactForm.value.email,
            message: this.contactForm.value.message,
          };
          const emailSent = await this.emailService.sendEmail(formData);
          console.log('This is your emailSent: ', emailSent);
        }
      });
  }
}
