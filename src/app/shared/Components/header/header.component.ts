import { isPlatformBrowser, Location } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  social = [
    {
      icon: 'fa-brands fa-github',
      url: 'https://github.com/EleazarGamezD',
    },
    {
      icon: 'fa-brands fa-linkedin',
      url: 'https://www.linkedin.com/in/eleazar-gamez/',
    },
  ];
  isBrowser: boolean;

  constructor(
    private router: Router,
    private location: Location,
    private activeRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.activeRoute.queryParams.subscribe((params) => {
      const elementId = params['scrollTo'];
      if (elementId) {
        this.scrollToElement(elementId);
      }
    });
    this.router.events.subscribe(() => {
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  scrollTo(elementId: string) {
    if (this.location.path() !== '/') {
      this.router
        .navigate(['/'], { queryParams: { scrollTo: elementId } })
        .then(() => {
          this.scrollToElement(elementId);
        });
    } else {
      this.scrollToElement(elementId);
    }
  }

  scrollToElement(elementId: string) {
    if (this.isBrowser) {
      const element = document.getElementById(elementId);
      console.log(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
