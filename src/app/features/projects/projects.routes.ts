import { Routes } from "@angular/router";

export const PROJECTS_ROUtES:Routes=[
    {
        path:'project',loadComponent:()=>import('./pages/projects-page/projects-page.component').then(c=>c.ProjectsPageComponent)
    }
]