import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Admin routes must NOT be prerendered — they require server-side auth
  {
    path: 'admin',
    renderMode: RenderMode.Server,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Server,
  },
  // Dynamic routes that depend on data cannot be statically prerendered
  {
    path: ':lang/projectDetails/:id',
    renderMode: RenderMode.Server,
  },
  // All other routes can be prerendered for best performance
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
