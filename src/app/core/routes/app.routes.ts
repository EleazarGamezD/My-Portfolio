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
          import('@shared/Components/project-details/project-details.component')
            .then(
              (m) => m.ProjectDetailsComponent,
            ),
      },
    ],
  };
}

function localizedAdminPublicRoute(lang: AppLanguage, adminPath: string, loadComponent: NonNullable<Route['loadComponent']>): Route {
  return {
    path: `${lang}/${adminPath}`,
    loadComponent,
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
      import('@pages/admin-dashboard/admin-login/admin-login.component')
        .then(
          (m) => m.AdminLoginComponent,
        ),
  },
  localizedAdminPublicRoute('es', 'admin/login', () =>
    import('@pages/admin-dashboard/admin-login/admin-login.component')
      .then((m) => m.AdminLoginComponent),
  ),
  localizedAdminPublicRoute('en', 'admin/login', () =>
    import('@pages/admin-dashboard/admin-login/admin-login.component')
      .then((m) => m.AdminLoginComponent),
  ),
  {
    path: 'admin/setup-account',
    loadComponent: () =>
      import('@pages/admin-dashboard/admin-setup-account/admin-setup-account.component')
        .then(
          (m) => m.AdminSetupAccountComponent,
        ),
  },
  localizedAdminPublicRoute('es', 'admin/setup-account', () =>
    import('@pages/admin-dashboard/admin-setup-account/admin-setup-account.component')
      .then((m) => m.AdminSetupAccountComponent),
  ),
  localizedAdminPublicRoute('en', 'admin/setup-account', () =>
    import('@pages/admin-dashboard/admin-setup-account/admin-setup-account.component')
      .then((m) => m.AdminSetupAccountComponent),
  ),
  {
    path: 'admin/forgot-password',
    loadComponent: () =>
      import('@pages/admin-dashboard/admin-forgot-password/admin-forgot-password.component')
        .then(
          (m) => m.AdminForgotPasswordComponent,
        ),
  },
  localizedAdminPublicRoute('es', 'admin/forgot-password', () =>
    import('@pages/admin-dashboard/admin-forgot-password/admin-forgot-password.component')
      .then((m) => m.AdminForgotPasswordComponent),
  ),
  localizedAdminPublicRoute('en', 'admin/forgot-password', () =>
    import('@pages/admin-dashboard/admin-forgot-password/admin-forgot-password.component')
      .then((m) => m.AdminForgotPasswordComponent),
  ),
  {
    path: 'admin/reset-password',
    loadComponent: () =>
      import('@pages/admin-dashboard/admin-reset-password/admin-reset-password.component')
        .then(
          (m) => m.AdminResetPasswordComponent,
        ),
  },
  localizedAdminPublicRoute('es', 'admin/reset-password', () =>
    import('@pages/admin-dashboard/admin-reset-password/admin-reset-password.component')
      .then((m) => m.AdminResetPasswordComponent),
  ),
  localizedAdminPublicRoute('en', 'admin/reset-password', () =>
    import('@pages/admin-dashboard/admin-reset-password/admin-reset-password.component')
      .then((m) => m.AdminResetPasswordComponent),
  ),
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('@pages/admin-dashboard/admin-layout/admin-layout.component')
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
        path: 'dashboard/overview',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/overview-page/overview-page.component')
            .then(
              (m) => m.AdminOverviewPageComponent,
            ),
      },
      {
        path: 'dashboard/projects',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/projects-page/projects-page.component')
            .then(
              (m) => m.AdminProjectsPageComponent,
            ),
      },
      {
        path: 'dashboard/projects/create',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/project-form-page/project-form-page.component')
            .then(
              (m) => m.AdminProjectFormPageComponent,
            ),
        data: {
          mode: 'create',
        },
      },
      {
        path: 'dashboard/projects/edit/:id',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/project-form-page/project-form-page.component')
            .then(
              (m) => m.AdminProjectFormPageComponent,
            ),
        data: {
          mode: 'edit',
        },
      },
      {
        path: 'dashboard/profile',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/profile-page/profile-page.component')
            .then(
              (m) => m.AdminProfilePageComponent,
            ),
      },
      {
        path: 'dashboard/media',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/portfolio-media-page/portfolio-media-page.component')
            .then(
              (m) => m.AdminPortfolioMediaPageComponent,
            ),
      },
      {
        path: 'dashboard/skills',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/skills-page/skills-page.component')
            .then(
              (m) => m.AdminSkillsPageComponent,
            ),
      },
      {
        path: 'dashboard/skills/create',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/skill-form-page/skill-form-page.component')
            .then(
              (m) => m.AdminSkillFormPageComponent,
            ),
        data: {
          mode: 'create',
        },
      },
      {
        path: 'dashboard/skills/edit/:id',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/skill-form-page/skill-form-page.component')
            .then(
              (m) => m.AdminSkillFormPageComponent,
            ),
        data: {
          mode: 'edit',
        },
      },
      {
        path: 'dashboard/experience',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/experience-page/experience-page.component')
            .then(
              (m) => m.AdminExperiencePageComponent,
            ),
      },
      {
        path: 'dashboard/experience/create',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/experience-form-page/experience-form-page.component')
            .then(
              (m) => m.AdminExperienceFormPageComponent,
            ),
        data: {
          mode: 'create',
        },
      },
      {
        path: 'dashboard/experience/edit/:id',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/experience-form-page/experience-form-page.component')
            .then(
              (m) => m.AdminExperienceFormPageComponent,
            ),
        data: {
          mode: 'edit',
        },
      },
      {
        path: 'dashboard/education',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/content-page/content-page.component')
            .then(
              (m) => m.AdminContentPageComponent,
            ),
        data: {
          resourceName: 'education',
          variant: 'education',
          sectionTitle: 'Educación',
          createTitle: 'Agregar educación',
          emptyMessage: 'No hay educación cargada.',
          kicker: 'CV académico',
          description: 'Gestiona estudios, instituciones, fechas y enlaces de respaldo para el CV generado.',
        },
      },
      {
        path: 'dashboard/education/create',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/cv-content-form-page/cv-content-form-page.component')
            .then(
              (m) => m.AdminCvContentFormPageComponent,
            ),
        data: {
          resourceName: 'education',
          mode: 'create',
        },
      },
      {
        path: 'dashboard/education/edit/:id',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/cv-content-form-page/cv-content-form-page.component')
            .then(
              (m) => m.AdminCvContentFormPageComponent,
            ),
        data: {
          resourceName: 'education',
          mode: 'edit',
        },
      },
      {
        path: 'dashboard/certifications',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/content-page/content-page.component')
            .then(
              (m) => m.AdminContentPageComponent,
            ),
        data: {
          resourceName: 'certifications',
          variant: 'certifications',
          sectionTitle: 'Certificados',
          createTitle: 'Agregar certificado',
          emptyMessage: 'No hay certificados cargados.',
          kicker: 'Credenciales verificables',
          description: 'Carga certificados de Udemy, Coursera, Platzi u otras plataformas con su enlace verificable.',
        },
      },
      {
        path: 'dashboard/certifications/create',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/cv-content-form-page/cv-content-form-page.component')
            .then(
              (m) => m.AdminCvContentFormPageComponent,
            ),
        data: {
          resourceName: 'certifications',
          mode: 'create',
        },
      },
      {
        path: 'dashboard/certifications/edit/:id',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/cv-content-form-page/cv-content-form-page.component')
            .then(
              (m) => m.AdminCvContentFormPageComponent,
            ),
        data: {
          resourceName: 'certifications',
          mode: 'edit',
        },
      },
      {
        path: 'dashboard/testimonials',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/testimonials-page/testimonials-page.component')
            .then(
              (m) => m.AdminTestimonialsPageComponent,
            ),
      },
      {
        path: 'dashboard/testimonials/create',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/testimonial-form-page/testimonial-form-page.component')
            .then(
              (m) => m.AdminTestimonialFormPageComponent,
            ),
        data: {
          mode: 'create',
        },
      },
      {
        path: 'dashboard/testimonials/edit/:id',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/testimonial-form-page/testimonial-form-page.component')
            .then(
              (m) => m.AdminTestimonialFormPageComponent,
            ),
        data: {
          mode: 'edit',
        },
      },
      {
        path: 'dashboard/testimonials/:id',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/testimonial-details-page/testimonial-details-page.component')
            .then(
              (m) => m.AdminTestimonialDetailsPageComponent,
            ),
      },
      {
        path: 'dashboard/contactMe',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/contact-me-page/contact-me-page.component')
            .then(
              (m) => m.AdminContactMePageComponent,
            ),
      },
      {
        path: 'dashboard/resumes',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/resumes-page/resumes-page.component')
            .then(
              (m) => m.AdminResumesPageComponent,
            ),
      },
      {
        path: 'dashboard/socialLinks',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/content-page/content-page.component')
            .then(
              (m) => m.AdminContentPageComponent,
            ),
        data: {
          resourceName: 'socialLinks',
          variant: 'socialLinks',
          sectionTitle: 'Social Links',
          createTitle: 'Create Social Link',
          emptyMessage: 'No social links found.',
          kicker: 'Distribution Channels',
          description: 'Control outbound networks, labels and URLs surfaced through the public portfolio.',
        },
      },
      {
        path: 'dashboard/users',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/users-page/users-page.component')
            .then(
              (m) => m.AdminUsersPageComponent,
            ),
      },
      {
        path: 'dashboard/themes',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/themes-page/themes-page.component')
            .then(
              (m) => m.AdminThemesPageComponent,
            ),
      },
      {
        path: 'dashboard/themes/create',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/theme-form-page/theme-form-page.component')
            .then(
              (m) => m.AdminThemeFormPageComponent,
            ),
        data: { mode: 'create' },
      },
      {
        path: 'dashboard/themes/edit/:id',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/theme-form-page/theme-form-page.component')
            .then(
              (m) => m.AdminThemeFormPageComponent,
            ),
        data: { mode: 'edit' },
      },
      {
        path: 'dashboard/dangerZone',
        loadComponent: () =>
          import('@pages/admin-dashboard/views/danger-zone-page/danger-zone-page.component')
            .then(
              (m) => m.DangerZonePageComponent,
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
