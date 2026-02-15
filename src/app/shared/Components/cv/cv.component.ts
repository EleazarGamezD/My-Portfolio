import {Component} from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-cv',
  imports: [],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss',
})
export class CvComponent {
  constructor(public i18nService: I18nService) {}

  Icons = SideIcons
  downloadCV(filename: string): void {
    const filePath = `assets/docs/${filename}`;
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filename;
    link.click();
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
