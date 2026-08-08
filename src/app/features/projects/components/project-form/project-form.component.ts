import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval, take, timer } from 'rxjs';
import { ProjectsService } from '../../services/projects.service';
import { ToastMassageComponent } from '../../../../shared/components/toast-massage/toast-massage.component';
import { Router, RouterLink } from '@angular/router';
import { IProject } from '../../interfaces/Iprojects';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';
import { SharedServiceService } from '../../../../shared/shared-service.service';

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
  private readonly sharedService = inject(SharedServiceService);
  private readonly route = inject(Router);
  isEdit = signal<boolean>(false);
  errorMsg = signal<string>('');
  toastMessage = signal('');
  title = input<string>('');
  titleButton = input('');
  projectSelected = signal<IProject | null>(null);
  constructor() {
    this.projectSelected.set(JSON.parse(sessionStorage.getItem(StORED_KEYS.project)!));
    if (this.projectSelected()) {
      this.isEdit.set(true);
      this.addProjectForm.patchValue({
        name: this.projectSelected()?.name ?? null,
        description: this.projectSelected()?.description,
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
          this.sharedService.unSelecteProject();

          this.toastMessage.set('Project created successfully');
          this.resetForm();
          timer(2000).subscribe(() => {
            this.toastMessage.set('');
            this.route.navigateByUrl(`/project`);
          });
        },
        error: (error: HttpErrorResponse) => {
          this.toastMessage.set('');

          this.errorMsg.set(error.error.msg);
          timer(2000).subscribe(() => {
            this.errorMsg.set('');
          });
        },
      });
    }
  }
  editProject() {
    this.toastMessage.set('');
    this.errorMsg.set('');
    if (this.addProjectForm.valid) {
      this.projectServices
        .updateProject(this.projectSelected()?.id!, this.addProjectForm.value)
        .subscribe({
          next: (resp) => {
            this.isEdit.set(false);
            this.projectServices.projectEdit.set(null);
            this.sharedService.unSelecteProject();
            this.toastMessage.set('Project Edit successfully');
            this.resetForm();
            timer(2000).subscribe(() => {
              this.toastMessage.set('');
              this.route.navigateByUrl('/project');
            });
          },
          error: (error: HttpErrorResponse) => {
            this.toastMessage.set('');
            this.errorMsg.set(error.error.msg);
            timer(2000).subscribe(() => {
              this.errorMsg.set('');
            });
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
