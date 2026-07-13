import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StORED_KEYS } from '../constants/STORED_KEYS';
import { environment } from '../../../environments/environment';
import { AuthServicesService } from '../../features/auth/services/auth-services.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServicesService);
  // const access_token = localStorage.getItem(StORED_KEYS.userToken);
  // const refresh_token = localStorage.getItem(StORED_KEYS.refresh_token);
  const access_token = authService.getToken();
  const refresh_token = authService.getRefreshToken();
  const router = inject(Router);
  if (access_token && refresh_token && environment.apiKey) {
    return true;
  }
  return router.navigateByUrl('/login');
};
