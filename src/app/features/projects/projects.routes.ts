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
        title: 'Projects',
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./pages/add-project/add-project.component').then((c) => c.AddProjectComponent),
        title: 'NewProject',
      },
      {
        path: 'my-statistics',
        loadComponent: () =>
          import('../../features/statistics/pages/statistics-page/statistics-page.component').then(
            (c) => c.StatisticsPageComponent
          ),
        title: 'Statistics',
      },

      {
        path: ':projectId',
        children: [
          {
            path: 'tasks',
            loadComponent: () =>
              import('../tasks/pages/tasks/tasks.component').then((c) => c.TasksComponent),
            title: 'Tasks',
          },
          {
            path: 'members',
            loadComponent: () =>
              import('../members/pages/members/members.component').then((c) => c.MembersComponent),
            title: 'Members',
          },
          {
            path: 'epics',
            loadComponent: () =>
              import('../epics/pages/epics/epics.component').then((c) => c.EpicsComponent),
            title: 'Epics',
          },
          {
            path: 'epics/new',
            loadComponent: () =>
              import('../epics/pages/add-new-epics-page/add-new-epics-page.component').then(
                (c) => c.AddNewEpicsPageComponent
              ),
            title: 'NewEpic',
          },
          {
            path: 'tasks/new',
            loadComponent: () =>
              import('../tasks/pages/task-form-page/task-form-page.component').then(
                (c) => c.TaskFormPageComponent
              ),
            title: 'NewTask',
          },
          {
            path: 'edit',
            loadComponent: () => import('./pages/edit/edit.component').then((c) => c.EditComponent),
            title: 'EditProject',
          },
        ],
      },
    ],
  },
];
