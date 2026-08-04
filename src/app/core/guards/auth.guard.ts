import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthServicesService } from '../../features/auth/services/auth-services.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServicesService);
  const isInvitePage = state.url.includes('/invite');
  const access_token = authService.getToken();
  const refresh_token = authService.getRefreshToken();
  const router = inject(Router);
  if (access_token && refresh_token && environment.apiKey && !authService.isRememberMeExpired()) {
    return true;
  }

  return router.navigate(['/login'], {
    queryParams: isInvitePage ? { returnUrl: state.url } : undefined,
  });
};
