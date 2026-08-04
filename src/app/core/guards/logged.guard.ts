import { CanActivateFn, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { AuthServicesService } from '../../features/auth/services/auth-services.service';

export const loggedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServicesService);

  const access_token = authService.getToken();
  const refresh_token = authService.getRefreshToken();
  const router = inject(Router);
  if (access_token && refresh_token && environment.apiKey && !authService.isRememberMeExpired()) {
    return router.navigateByUrl('/project');
  }
  return true;
};
