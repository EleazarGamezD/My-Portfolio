import {Component} from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';

@Component({
  selector: 'app-cv',
  imports: [],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss',
})
export class CvComponent {
  Icons = SideIcons
  downloadCV(filename: string): void {
    const filePath = `assets/docs/${filename}`;
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filename;
    link.click();
  }
}
