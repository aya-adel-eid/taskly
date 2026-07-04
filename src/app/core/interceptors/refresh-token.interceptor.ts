import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthServicesService } from '../../features/auth/services/auth-services.service';
import { environment } from '../../../environments/environment';
import { StORED_KEYS } from '../constants/STORED_KEYS';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServicesService);

  const refreshToken = localStorage.getItem(StORED_KEYS.refresh_token);
  const token = localStorage.getItem(StORED_KEYS.userToken);


  if (!req.headers.has('Authorization') && token) {
    req = req.clone({
      setHeaders: {
        apikey: environment.apiKey,
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (req.url.includes('/auth/v1/user')) {
        return throwError(() => error);
      }

      if (
        (error.status === 401 || error.status === 403) &&
        !req.url.includes('/token')
      ) {
        return authService.refreshToken(refreshToken!).pipe(
          switchMap((res) => {

            localStorage.setItem(StORED_KEYS.userToken, res.access_token);
            localStorage.setItem(StORED_KEYS.refresh_token, res.refresh_token);

            const newReq = req.clone({
              setHeaders: {
                apikey: environment.apiKey,
                Authorization: `Bearer ${res.access_token}`
              }
            });

            return next(newReq);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
