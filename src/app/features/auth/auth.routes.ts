import { Routes } from '@angular/router';
import { resetPassGuard } from '../../core/guards/resetPassword/reset-pass.guard';
import { recoveryPassGuard } from '../../core/guards/recovery-pass/recovery-pass.guard';

export const AUTH_ROUTES: Routes = [
  {
    canActivate: [recoveryPassGuard],
    path: '',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then((c) => c.LoginPageComponent),
    title: 'Signin',
  },
  {
    canActivate: [recoveryPassGuard],
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then((c) => c.LoginPageComponent),
    title: 'Signin',
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/signup-page/signup-page.component').then((c) => c.SignupPageComponent),
    title: 'Sign-Up',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forget-password-page/forget-password-page.component').then(
        (c) => c.ForgetPasswordPageComponent
      ),
    title: 'ForgetPassword',
  },
  {
    canActivate: [resetPassGuard],
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password-page/reset-password-page.component').then(
        (c) => c.ResetPasswordPageComponent
      ),
    title: 'RestPassword',
  },
];
