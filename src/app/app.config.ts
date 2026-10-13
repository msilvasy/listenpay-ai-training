import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';
import { SessionService } from './auth/session.service';
import { ThemeService } from './theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Read the Dashboard Suite hand-off (industry + JWT) before the router sees the URL.
    provideAppInitializer(() => {
      const { industry } = inject(SessionService).consumeHandoff();
      // A fresh industry selection always opens in that industry's theme.
      if (industry) inject(ThemeService).setEnabled(true);
    }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
