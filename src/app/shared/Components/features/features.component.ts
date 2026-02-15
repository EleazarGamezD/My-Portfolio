import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ITechStack} from '@core/interfaces/techStack/techStack.interface';
import { I18nService } from '@core/services/i18n/i18n.service';
import {techStack} from '@shared/Json/techStack';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  constructor(public i18nService: I18nService) {}

  stack: ITechStack[] = techStack

  t(key: string) {
    return this.i18nService.t(key);
  }
}
