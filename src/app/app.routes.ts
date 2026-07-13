import { Routes } from '@angular/router';
import { loggedGuard } from './core/guards/logged.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // auth
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/auth-layout/auth-layout.component').then((c) => c.AuthLayoutComponent),
    canActivate: [loggedGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((c) => c.AUTH_ROUTES),
  },
  // user
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.component').then((c) => c.MainLayoutComponent),
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/projects/projects.routes').then((c) => c.PROJECTS_ROUtES),
  },
];
