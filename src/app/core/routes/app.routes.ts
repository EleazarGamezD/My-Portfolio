import {Routes} from '@angular/router';
import {MainLayoutComponent} from '@layouts/main-layout/main-layout.component';
import {HomeComponent} from '@pages/home/home.component';
import {ProjectDetailsComponent} from '@pages/project-details/project-details.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        /*  loadComponent: () =>
           import('@pages/home/home.component')
             .then(
               (m) => m.HomeComponent
             ), */
      },
      {
        path: 'projectDetails/:id',
        component: ProjectDetailsComponent,

        /*  loadComponent: () =>
           import('@pages/project-details/project-details.component')
             .then(
               (m) => m.ProjectDetailsComponent,
             ), */
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
