import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ITechStack} from '@core/interfaces/techStack/techStack.interface';
import {techStack} from '@shared/Json/techStack';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  stack: ITechStack[] = techStack
}
