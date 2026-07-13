import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const resetPassGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const hasToken =
    window.location.hash.includes('access_token=') || route.fragment?.includes('access_token=');

  if (hasToken) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
