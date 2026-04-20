import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { routes } from '@core/routes/app.routes';
import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { StorageModule } from '@ngx-pwa/local-storage';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { provideToastr } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
    ),
    provideClientHydration(withEventReplay()),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.reCaptchaSiteKey },
    importProvidersFrom(RecaptchaV3Module, StorageModule.forRoot({}), SidebarModule, DropdownModule),
    IconSetService,
    provideAnimations(),
    provideToastr(),
  ],
};
