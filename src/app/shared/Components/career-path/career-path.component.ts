import { Component } from '@angular/core';
import { ICareerPath } from '@core/interfaces/carrer-path/carrer-path.interface';

@Component({
  selector: 'app-career-path',
  imports: [],
  templateUrl: './career-path.component.html',
  styleUrl: './career-path.component.scss',
})
export class CareerPathComponent {
  careerPathArray: ICareerPath[] = [
    {
      year: '2024 - Actual',
      title: 'Meraki Office',
      description:
        'Desarrollador Fullstack, Creación de Marketplace, integración de pasarelas de pago, chats, empresas de logística.',
    },
    {
      year: '2024-2025',
      title: 'Sendifico',
      description:
        'Desarrollador Backend, integraciones de plataformas de logística.',
    },
    {
      year: '2023-Actual',
      title: 'Freelance',
      description:
        'Desarrollador Fullstack, en desarrollo de proyectos personalizados.',
    },
    {
      year: '2018-2023',
      title: 'PosTouch  Colombia S.A.S',
      description:
        'Jefe de departamento Técnico, soporte a sistemas fiscales y contables.',
    },
    {
      year: '2013-2018',
      title: 'Retail Pos systems tec. C.A.',
      description:
        'Jefe de departamento Técnico, soporte a sistemas fiscales y contables.',
    },
  ];
}
