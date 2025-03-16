import {Component} from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import {ICareerPath} from '@core/interfaces/carrer-path/carrer-path.interface';
import {careerPath} from '@shared/Json/carrerPath';

@Component({
  selector: 'app-career-path',
  imports: [],
  templateUrl: './career-path.component.html',
  styleUrl: './career-path.component.scss',
})
export class CareerPathComponent {
  careerPathArray: ICareerPath[] = careerPath
  Icons = SideIcons
}
