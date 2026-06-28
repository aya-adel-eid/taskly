import { Routes } from '@angular/router';

export const routes: Routes = [
    // auth
{
    path:'',loadComponent:()=>import('./core/layout/auth-layout/auth-layout.component').then(c=>c.AuthLayoutComponent),
    loadChildren:()=>import('./features/auth/auth.routes').then(c=>c.AUTH_ROUTES)

},
// user
{
    path:'',loadComponent:()=>import('./core/layout/main-layout/main-layout.component').then(c=>c.MainLayoutComponent),
    loadChildren:()=>import('./features/projects/projects.routes').then(c=>c.PROJECTS_ROUtES)
}
];
