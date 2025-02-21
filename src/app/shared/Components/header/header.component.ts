import { Component, OnInit } from '@angular/core';
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

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activeRoute.queryParams.subscribe((params) => {
      const elementId = params['scrollTo'];
      if (elementId) {
        this.scrollToElement(elementId);
      }
    });
    this.router.events.subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  scrollTo(elementId: string) {
    const url = this.router
      .createUrlTree([], { queryParams: { scrollTo: elementId } })
      .toString();
    this.router.navigateByUrl(url).then(() => {
      this.scrollToElement(elementId);
    });
  }

  scrollToElement(elementId: string) {
    const element = document.getElementById(elementId);
    console.log(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
