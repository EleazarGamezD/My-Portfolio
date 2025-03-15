import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  techStack = [
    {
      iconUrl: '/assets/shared/svg/angular-svgrepo-com.svg',
      name: 'Angular',
    },
    {
      iconUrl: '/assets/shared/svg/bootstrap-svgrepo-com.svg',
      name: 'Bootstrap',
    },
    {
      iconUrl: '/assets/shared/svg/node-js-svgrepo-com.svg',
      name: 'Node.js - Express',
    },
    {
      iconUrl: '/assets/shared/svg/docker-svgrepo-com.svg',
      name: 'Docker',
    },
    {
      iconUrl: '/assets/shared/svg/nestjs-svgrepo-com.svg',
      name: 'Nest.js',
    },
    {
      iconUrl: '/assets/shared/svg/postman-icon-svgrepo-com.svg',
      name: 'Postman',
    },
    {
      iconUrl: '/assets/shared/svg/typescript-logo-svgrepo-com.svg',
      name: 'TypeScript',
    },
  ];
}
