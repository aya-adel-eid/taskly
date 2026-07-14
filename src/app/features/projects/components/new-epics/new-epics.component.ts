import { Component, inject, signal } from '@angular/core';
import { RusableInputComponent } from '../../../auth/components/rusable-input/rusable-input.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { Member } from '../../interfaces/IMembers';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';

@Component({
  selector: 'app-new-epics',
  standalone: true,
  imports: [RusableInputComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './new-epics.component.html',
  styleUrl: './new-epics.component.css',
})
export class NewEpicsComponent {
  private readonly projectServices = inject(ProjectsService);
  private readonly activateRoute = inject(ActivatedRoute);

  allMembers = signal<Member[] | null>(null);
  projectId = signal<string>('');
  private destroy$ = new Subject<void>();
  // form
  today = new Date().toISOString().split('T')[0];
  private readonly fb = inject(FormBuilder);
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => this.projectId.set(param.get('projectId')!));

    this.getAllMembers();
  }
  addNewEpics = this.fb.group({
    title: [null, [Validators.required, Validators.minLength(3)]],
    description: [null],
    assignee_id: [null],
    project_id: [sessionStorage.getItem(StORED_KEYS.projectId)],
    deadline: [
      null,
      (control: AbstractControl) => {
        if (!control.value) return null;

        return control.value >= this.today ? null : { invalidDate: true };
      },
    ],
  });

  addEpics() {
    console.log(this.addNewEpics.value);
    if (this.addNewEpics.valid) {
      this.projectServices.addNewEpics(this.addNewEpics.value).subscribe({
        next: (resp) => {
          console.log(resp);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
    }
  }

  getAllMembers() {
    this.projectServices
      .getAllMembers(this.projectId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          console.log(resp);
          this.allMembers.set(resp);
        },
        error: (error: HttpErrorResponse) => {},
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
