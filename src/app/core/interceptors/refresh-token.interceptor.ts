import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthServicesService } from '../../features/auth/services/auth-services.service';
import { environment } from '../../../environments/environment';
import { StORED_KEYS } from '../constants/STORED_KEYS';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServicesService);

  const token = localStorage.getItem(StORED_KEYS.userToken);
  const refreshToken = localStorage.getItem(StORED_KEYS.refresh_token);

  // متضيفش Authorization على Request الـ refresh نفسه
  if (!req.url.includes('/auth/v1/token') && token) {
    req = req.clone({
      setHeaders: {
        apikey: environment.apiKey,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // لو الـ refresh نفسه فشل متعملش retry
      if (
        req.url.includes('/auth/v1/token') ||
        error.status !== 401
      ) {
        return throwError(() => error);
      }

      if (!refreshToken) {
        return throwError(() => error);
      }

      return authService.refreshToken(refreshToken).pipe(
        switchMap((res) => {
          localStorage.setItem(
            StORED_KEYS.userToken,
            res.access_token
          );

          localStorage.setItem(
            StORED_KEYS.refresh_token,
            res.refresh_token
          );

          const retryRequest = req.clone({
            setHeaders: {
              apikey: environment.apiKey,
              Authorization: `Bearer ${res.access_token}`,
            },
          });

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          localStorage.removeItem(StORED_KEYS.userToken);
          localStorage.removeItem(StORED_KEYS.refresh_token);

          return throwError(() => refreshError);
        })
      );
    })
  );
};
