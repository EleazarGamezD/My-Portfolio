import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/Components/footer/footer.component';
import { HeaderComponent } from '../../shared/Components/header/header.component';
import { ScrollIndicatorComponent } from '../../shared/Components/scroll-indicator/scroll-indicator.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterOutlet,
    ScrollIndicatorComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {}
