import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { AddTaskFormComponent } from '../../components/add-task-form/add-task-form.component';

@Component({
  selector: 'app-task-form-page',
  standalone: true,
  imports: [BreadcrumbComponent, AddTaskFormComponent],
  templateUrl: './task-form-page.component.html',
  styleUrl: './task-form-page.component.css',
})
export class TaskFormPageComponent {}
