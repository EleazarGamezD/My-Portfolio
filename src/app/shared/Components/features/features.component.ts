import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  imports: [],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  techStack = [
    {
      iconUrl: '/assets/images/svg/angular-svgrepo-com.svg',
      name: 'Angular',
    },
    {
      iconUrl: '/assets/images/svg/bootstrap-svgrepo-com.svg',
      name: 'Bootstrap',
    },
    {
      iconUrl: '/assets/images/svg/node-js-svgrepo-com.svg',
      name: 'Node.js - Express',
    },
    {
      iconUrl: '/assets/images/svg/docker-svgrepo-com.svg',
      name: 'Docker',
    },
    {
      iconUrl: '/assets/images/svg/nestjs-svgrepo-com.svg',
      name: 'Nest.js',
    },
    {
      iconUrl: '/assets/images/svg/postman-icon-svgrepo-com.svg',
      name: 'Postman',
    },
    {
      iconUrl: '/assets/images/svg/typescript-logo-svgrepo-com.svg',
      name: 'TypeScript',
    },
  ];
}
