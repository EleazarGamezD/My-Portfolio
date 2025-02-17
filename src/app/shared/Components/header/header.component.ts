import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(
    private router: Router,
    private location: Location,
  ) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  scrollTo(elementId: string) {
    if (this.location.path() !== '/') {
      this.router.navigate(['/']).then(() => {
        this.scrollToElement(elementId);
      });
    } else {
      this.scrollToElement(elementId);
    }
  }
  scrollToElement(elementId: string) {
    const element = document.getElementById(elementId);
    console.log(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
