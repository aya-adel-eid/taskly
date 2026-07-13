import { Routes } from '@angular/router';

export const PROJECTS_ROUtES: Routes = [
  {
    path: 'project',
    loadComponent: () =>
      import('./pages/projects-page/projects-page.component').then((c) => c.ProjectsPageComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/list-projects/list-projects.component').then(
            (c) => c.ListProjectsComponent
          ),
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./pages/add-project/add-project.component').then((c) => c.AddProjectComponent),
      },

      {
        path: ':projectId',
        children: [
          {
            path: 'tasks',
            loadComponent: () =>
              import('./pages/tasks/tasks.component').then((c) => c.TasksComponent),
          },
          {
            path: 'members',
            loadComponent: () =>
              import('./pages/members/members.component').then((c) => c.MembersComponent),
          },
          {
            path: 'epics',
            loadComponent: () =>
              import('./pages/epics/epics.component').then((c) => c.EpicsComponent),
            // children: [
            //   {
            //     path: 'new',
            //     loadComponent: () =>
            //       import('./pages/add-new-epics-page/add-new-epics-page.component').then(
            //         (c) => c.AddNewEpicsPageComponent
            //       ),
            //   },
            // ],
          },
          {
            path: 'epics/new',
            loadComponent: () =>
              import('./pages/add-new-epics-page/add-new-epics-page.component').then(
                (c) => c.AddNewEpicsPageComponent
              ),
          },
          {
            path: 'edit',
            loadComponent: () => import('./pages/edit/edit.component').then((c) => c.EditComponent),
          },
        ],
      },
    ],
  },
];
