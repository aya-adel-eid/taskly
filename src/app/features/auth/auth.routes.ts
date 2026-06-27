import { Routes } from "@angular/router";

export const AUTH_ROUTES:Routes=[
    {
    path:'',loadComponent:()=>import('./pages/login-page/login-page.component').then(c=>c.LoginPageComponent)
  }
    ,
  {
    path:'login',loadComponent:()=>import('./pages/login-page/login-page.component').then(c=>c.LoginPageComponent)
  }
  ,{
    path:'sign-up',loadComponent:()=>import('./pages/signup-page/signup-page.component').then(c=>c.SignupPageComponent)
  }
]