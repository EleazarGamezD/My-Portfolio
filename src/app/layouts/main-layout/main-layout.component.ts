import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@portfolio/components/footer/footer.component';
import { HeaderComponent } from '@portfolio/components/header/header.component';
import { LoaderCircleComponent } from '@portfolio/components/loader-circle/loader-circlecomponent';
import { ScrollIndicatorComponent } from '@portfolio/components/scroll-indicator/scroll-indicator.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    FooterComponent,
    LoaderCircleComponent,
    RouterOutlet,
    ScrollIndicatorComponent,
  ],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {}
