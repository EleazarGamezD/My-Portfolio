import { Component } from '@angular/core';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-contact-me-hello',
  standalone: true,
  imports: [],
  templateUrl: './contact-me-hello.component.html',
  styleUrl: './contact-me-hello.component.scss',
})
export class ContactMeHelloComponent {
  constructor(public i18nService: I18nService) {}

  t(key: string) {
    return this.i18nService.t(key);
  }
}
