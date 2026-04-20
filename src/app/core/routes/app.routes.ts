import { Route, Routes } from '@angular/router';
import { adminAuthGuard } from '@core/guards/admin-auth.guard';
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
      import('@pages/admin-login/admin-login.component')
        .then(
          (m) => m.AdminLoginComponent,
        ),
  },
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('@pages/admin-layout/admin-layout.component')
        .then(
          (m) => m.AdminLayoutComponent,
        ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard/overview',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        redirectTo: 'dashboard/overview',
        pathMatch: 'full',
      },
      {
        path: 'dashboard/:section',
        loadComponent: () =>
          import('@pages/admin-dashboard/admin-dashboard.component')
            .then(
              (m) => m.AdminDashboardComponent,
            ),
      },
    ],
  },
  {
    path: 'admin-dashboard',
    redirectTo: 'admin/dashboard/overview',
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
