import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const recoveryPassGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const hash = window.location.hash;

  
  if (
    hash.includes('type=recovery') &&
    state.url !== '/reset-password'
  ) {
    return router.createUrlTree(['/reset-password'], {
      fragment: hash.substring(1)
    });
  }

  return true;
};
