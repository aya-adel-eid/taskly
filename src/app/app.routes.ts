import { Routes } from '@angular/router';

export const routes: Routes = [
    // auth
{
    path:'',loadComponent:()=>import('./core/layout/auth-layout/auth-layout.component').then(c=>c.AuthLayoutComponent)

},
// user
{
    path:'',loadComponent:()=>import('./core/layout/main-layout/main-layout.component').then(c=>c.MainLayoutComponent)
}
];
