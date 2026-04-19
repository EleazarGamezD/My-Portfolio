import { Route, Routes } from '@angular/router';
import { AppLanguage, DEFAULT_LANGUAGE } from '@core/i18n/i18n.config';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';

function localizedRoute(lang: AppLanguage): Route {
  return {
    path: lang,
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@pages/home/home.component')
            .then(
              (m) => m.HomeComponent,
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
  };
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: DEFAULT_LANGUAGE,
    pathMatch: 'full',
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('@pages/admin-dashboard/admin-dashboard.component')
        .then(
          (m) => m.AdminDashboardComponent,
        ),
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('@pages/admin-dashboard/admin-dashboard.component')
        .then(
          (m) => m.AdminDashboardComponent,
        ),
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('@pages/admin-dashboard/admin-dashboard.component')
        .then(
          (m) => m.AdminDashboardComponent,
        ),
  },
  localizedRoute('es'),
  localizedRoute('en'),
  {
    path: 'home',
    redirectTo: DEFAULT_LANGUAGE,
    pathMatch: 'full',
  },
  {
    path: 'projectDetails/:id',
    redirectTo: `${DEFAULT_LANGUAGE}/projectDetails/:id`,
  },
  {
    path: '**',
    redirectTo: DEFAULT_LANGUAGE,
  },
];
