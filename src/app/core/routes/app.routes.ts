import {Routes} from '@angular/router';
import {MainLayoutComponent} from '@layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@pages/home/home.component')
            .then(
              (m) => m.HomeComponent
            ),
      },
      {
        path: 'projectDetails/:id',
        loadComponent: () =>
          import('@pages/project-details/project-details.component')
            .then(
              (m) => m.ProjectDetailsComponent,
            ),
      },
    ],
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
