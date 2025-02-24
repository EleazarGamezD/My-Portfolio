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
import { RecaptchaService } from '@services/recaptcha/recaptcha.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ToastrService } from 'ngx-toastr';
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
  sendingEmail: boolean = false;
  constructor(
    private emailService: EmailService,
    private fb: FormBuilder,
    private recaptchaV3Service: ReCaptchaV3Service,
    private recaptchaService: RecaptchaService,
    private toastr: ToastrService,
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
    });
  }

  async onSubmit() {
    //first we get the token from the reCaptchaV3Service
    //then we add the token to the form data
    //then we send the form data to the email service only if the form is valid
    //if the token is not verified, we log the error

    //if the form is not valid, we return
    if (!this.contactForm.valid) {
      this.toastr.error('Formulario inválido', 'Error', {
        timeOut: 3000,
      });
    } else {
      this.sendingEmail = true;
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
            message: this.contactForm.value.message,
          };

          const emailSent = await this.emailService.sendEmail(formData);
          if (emailSent) {
            this.contactForm.reset();
            this.toastr.success('Email enviado con éxito', 'Exito', {
              timeOut: 3000,
            });
          }
        } else {
          this.toastr.error('reCAPTCHA falló', 'Error', {
            timeOut: 3000,
          });
        }
      } catch {
        this.toastr.error('Error en el proceso', 'Error', {
          timeOut: 3000,
        });
      } finally {
        this.sendingEmail = false;
      }
    }
  }
}
