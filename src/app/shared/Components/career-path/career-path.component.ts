import {Component} from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import {ICareerPath} from '@core/interfaces/carrer-path/carrer-path.interface';
import { I18nService } from '@core/services/i18n/i18n.service';
import {careerPath} from '@shared/Json/carrerPath';

@Component({
  selector: 'app-career-path',
  imports: [],
  templateUrl: './career-path.component.html',
  styleUrl: './career-path.component.scss',
})
export class CareerPathComponent {
  constructor(public i18nService: I18nService) {}

  careerPathArray: ICareerPath[] = careerPath
  Icons = SideIcons

  getDescription(item: ICareerPath) {
    return this.i18nService.selectText(item.descriptionEs, item.descriptionEn);
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}
