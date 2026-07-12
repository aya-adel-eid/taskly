import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthServicesService } from '../../features/auth/services/auth-services.service';
import { environment } from '../../../environments/environment';
import { StORED_KEYS } from '../constants/STORED_KEYS';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServicesService);

  const token = authService.getToken();

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
      if (req.url.includes('/auth/v1/token') || error.status !== 401) {
        return throwError(() => error);
      }

      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        authService.logOut();
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken(refreshToken).pipe(
          switchMap((res) => {
            isRefreshing = false;

            authService.updateStoredTokens(res.access_token, res.refresh_token);

            refreshTokenSubject.next(res.access_token);

            const retryRequest = req.clone({
              setHeaders: {
                apikey: environment.apiKey,
                Authorization: `Bearer ${res.access_token}`,
              },
            });

            return next(retryRequest);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshTokenSubject.next(null);

            authService.logOut();

            return throwError(() => refreshError);
          })
        );
      }

      return refreshTokenSubject.pipe(
        filter((newToken) => newToken !== null),
        take(1),
        switchMap((newToken) => {
          const retryRequest = req.clone({
            setHeaders: {
              apikey: environment.apiKey,
              Authorization: `Bearer ${newToken}`,
            },
          });
          return next(retryRequest);
        })
      );
    })
  );
};
