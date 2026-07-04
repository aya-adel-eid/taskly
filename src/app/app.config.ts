import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiKeyInterceptor } from './core/interceptors/interceptors/api-key.interceptor';
import { refreshTokenInterceptor } from './core/interceptors/refresh-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes  , withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withViewTransitions(),
    ),
    provideHttpClient(withFetch(),withInterceptors([apiKeyInterceptor,refreshTokenInterceptor]))]
};
