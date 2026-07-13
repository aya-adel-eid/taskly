import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { StORED_KEYS } from '../../constants/STORED_KEYS';
import { inject } from '@angular/core';
import { AuthServicesService } from '../../../features/auth/services/auth-services.service';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const authServices = inject(AuthServicesService);
  if (req.urlWithParams.includes('signup') || req.urlWithParams.includes('grant_type=password')) {
    req = req.clone({
      setHeaders: {
        apikey: environment.apiKey,
      },
    });
  } else {
    const headers: Record<string, string> = {
      apikey: environment.apiKey,
    };

    if (!req.headers.has('Authorization')) {
      // const token = localStorage.getItem(StORED_KEYS.userToken);
      const token = authServices.getToken()!;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    req = req.clone({
      setHeaders: headers,
    });
  }

  return next(req);
};
