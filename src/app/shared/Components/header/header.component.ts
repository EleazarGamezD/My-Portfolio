import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  constructor(
    private router: Router,
    private location: Location,
  ) {}
  ngOnInit(): void {
    this.router.events.subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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
