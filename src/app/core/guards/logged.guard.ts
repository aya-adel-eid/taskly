import { CanActivateFn, Router } from '@angular/router';
import { StORED_KEYS } from '../constants/STORED_KEYS';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';

export const loggedGuard: CanActivateFn = (route, state) => {
  const access_token = localStorage.getItem(StORED_KEYS.userToken);
  const refresh_token = localStorage.getItem(StORED_KEYS.refresh_token);
  const router = inject(Router);
  if (access_token && refresh_token && environment.apiKey) {
    return router.navigateByUrl('/project');
  }
  return true;
};
