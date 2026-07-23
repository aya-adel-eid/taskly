import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval, take } from 'rxjs';
import { ProjectsService } from '../../services/projects.service';
import { ToastMassageComponent } from '../toast-massage/toast-massage.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule, ToastMassageComponent, RouterLink],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly projectServices = inject(ProjectsService);
  private readonly route = inject(Router);
  isEdit = signal<boolean>(false);
  errorMsg = signal<string>('');
  toastMessage = signal('');
  title = input<string>('');
  titleButton = input('');
  constructor() {
    if (this.projectServices.selectedProjectId() && this.projectServices.projectEdit()) {
      this.isEdit.set(true);
      this.addProjectForm.patchValue({
        name: this.projectServices.projectEdit()?.name ?? null,
        description: this.projectServices.projectEdit()?.description!,
      });
    }
  }
  // form
  addProjectForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });
  resetForm() {
    this.addProjectForm.reset();
  }

  // call api
  createNewProject() {
    this.toastMessage.set('');
    this.errorMsg.set('');
    if (this.addProjectForm.valid) {
      this.projectServices.createNewProject(this.addProjectForm.value).subscribe({
        next: (resp) => {
          this.errorMsg.set('');
          console.log(resp);
          this.toastMessage.set('Project created successfully');
          this.resetForm();
          interval(1000)
            .pipe(take(5))
            .subscribe(() => {
              this.toastMessage.set('');
              this.route.navigateByUrl(`/project`);
            });
        },
        error: (error: HttpErrorResponse) => {
          this.toastMessage.set('');
          this.errorMsg.set(error.error.msg);
          console.log(error);
        },
      });
    }
  }
  editProject() {
    this.toastMessage.set('');
    this.errorMsg.set('');
    if (this.addProjectForm.valid) {
      this.projectServices
        .updateProject(this.projectServices.projectEdit()?.id!, this.addProjectForm.value)
        .subscribe({
          next: (resp) => {
            this.isEdit.set(false);
            this.projectServices.projectEdit.set(null);

            this.toastMessage.set('Project Edit successfully');
            this.resetForm();
            interval(1000)
              .pipe(take(5))
              .subscribe(() => {
                this.toastMessage.set('');
              });
          },
          error: (error: HttpErrorResponse) => {
            console.log(error);
            this.toastMessage.set('');
            this.errorMsg.set(error.error.msg);
          },
        });
    }
  }
  submitData() {
    if (this.isEdit()) {
      this.editProject();
    } else this.createNewProject();
  }
}
