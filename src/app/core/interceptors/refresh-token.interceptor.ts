import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthServicesService } from '../../features/auth/services/auth-services.service';
import { environment } from '../../../environments/environment.development';
import { catchError, switchMap, throwError } from 'rxjs';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServicesService);
  const token = authService.getToken();
  const refreshToken = authService.getRefreshToken();
  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      apikey: environment.apiKey,
    },
  });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 => Unauthorized    403=>Forbidden
      if (error.status === 401 || error.status === 403) {
        //
        console.log(error.status, 'errror');

        return authService.refreshToken({ refresh_token: refreshToken! }).pipe(
          switchMap((resp) => {
            console.log('new token:', resp.access_token);
            console.log('new refresh:', resp.refresh_token);

            authService.updateStoredTokens(resp.access_token, resp.refresh_token);
            const newAuthToken = req.clone({
              setHeaders: {
                Authorization: `Bearer ${resp.access_token}`,
                apikey: environment.apiKey,
              },
            });
            return next(newAuthToken);
          }),
          catchError((refreshError) => {
            authService.logOut();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
