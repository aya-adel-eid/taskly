import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiKeyInterceptor } from './core/interceptors/interceptors/api-key.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes  , withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withViewTransitions(),
      withHashLocation()),
    provideHttpClient(withFetch(),withInterceptors([apiKeyInterceptor]))]
};
