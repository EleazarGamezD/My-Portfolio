import {Component, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private meta: Meta,
    private titleService: Title,
    private router: Router
  ) { }

  title = 'Eleazar Gámez Fullstack Developer';

  ngOnInit(): void {
    this.meta.addTag({name: 'author', content: 'Eleazar Gámez'});

    this.meta.addTags([
      {name: 'robots', content: 'index, follow'},
      {name: 'description', content: 'Portfolio profesional de Eleazar Gámez, Fullstack Developer especializado en Angular, Node.js y más tecnologías web.'}
    ]);


    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      let routeTitle = this.getRouteTitle(this.router.url);
      this.titleService.setTitle(`${routeTitle} | ${this.title}`);


      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('router-navigation-end', {
          detail: {url: this.router.url}
        }));
        console.log('🧭 Navegación completada a:', this.router.url);
      }
    });
  }


  private getRouteTitle(url: string): string {
    if (url === '/') {
      return 'Inicio';
    } else if (url.includes('/projectDetails')) {
      return 'Detalle de Proyecto';
    } else if (url.includes('/cv')) {
      return 'Curriculum Vitae';
    }

    return this.title;
  }
}
