import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthServicesService } from '../../features/auth/services/auth-services.service';
import { environment } from '../../../environments/environment';
import { StORED_KEYS } from '../constants/STORED_KEYS';

// متشاركين بره الـ function عشان يفضلوا نفس القيمة بين كل الـ requests
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServicesService);

  const token = localStorage.getItem(StORED_KEYS.userToken);

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

      const refreshToken = localStorage.getItem(StORED_KEYS.refresh_token);
      if (!refreshToken) {
        return throwError(() => error);
      }

      // لو مفيش refresh شغال دلوقتي، ابدئي واحد واحفظي إنك بتعملي refresh
      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null); // نظّفي القيمة القديمة

        return authService.refreshToken(refreshToken).pipe(
          switchMap((res) => {
            isRefreshing = false;

            localStorage.setItem(StORED_KEYS.userToken, res.access_token);
            localStorage.setItem(StORED_KEYS.refresh_token, res.refresh_token);

            // بلّغي كل الـ requests المنتظرة إن التوكن الجديد جاهز
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

            localStorage.removeItem(StORED_KEYS.userToken);
            localStorage.removeItem(StORED_KEYS.refresh_token);

            return throwError(() => refreshError);
          })
        );
      }

      // لو الـ refresh شغال بالفعل، استنّي لحد ما يخلص واستخدمي التوكن الجديد
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
