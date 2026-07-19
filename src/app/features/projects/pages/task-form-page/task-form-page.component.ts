import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { AddTaskFormComponent } from '../../components/add-task-form/add-task-form.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-form-page',
  standalone: true,
  imports: [BreadcrumbComponent, AddTaskFormComponent],
  templateUrl: './task-form-page.component.html',
  styleUrl: './task-form-page.component.css',
})
export class TaskFormPageComponent implements OnInit {
  private readonly activateRoute = inject(ActivatedRoute);
  projectId = signal<string>('');
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => this.projectId.set(param.get('projectId')!));
  }
  arrPaths = computed(() => [
    {
      label: 'Epics',
      path: `/project/${this.projectId()}/ epics`,
    },
    {
      label: 'New Epics',
      path: `/project/${this.projectId()}/epics/new`,
    },
  ]);
}
