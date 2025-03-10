import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {HeaderComponent} from '../header/header.component';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent extends HeaderComponent {

  date = new Date().getFullYear();
}
