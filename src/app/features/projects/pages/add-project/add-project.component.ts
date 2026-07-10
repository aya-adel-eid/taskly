import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ToastMassageComponent } from '../../components/toast-massage/toast-massage.component';
import { interval, take } from 'rxjs';
import { ProjectFormComponent } from '../../components/project-form/project-form.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ToastMassageComponent,
    ProjectFormComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.css',
})
export class AddProjectComponent {
  arrPath = [{ label: 'ADD NEW PROJCCT', path: `/project/add` }];
}
