import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const recoveryPassGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const hash = window.location.hash;

  const allowedRoutes = ['/reset-password', '/login'];

  if (hash.includes('type=recovery') && !allowedRoutes.includes(state.url)) {
    return router.createUrlTree(['/reset-password'], {
      fragment: hash.substring(1),
    });
  }

  return true;
};
