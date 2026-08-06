import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RusableInputComponent } from '../../../auth/components/rusable-input/rusable-input.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectsService } from '../../../projects/services/projects.service';
import { Member } from '../../../members/interfaces/IMembers';
import { interval, Subject, take, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';
import { ToastMassageComponent } from '../../../../shared/components/toast-massage/toast-massage.component';
import { EpicsService } from '../../services/epics.service';
import { MembersService } from '../../../members/services/members.service';

@Component({
  selector: 'app-new-epics',
  standalone: true,
  imports: [RusableInputComponent, RouterLink, ReactiveFormsModule, ToastMassageComponent],
  templateUrl: './new-epics.component.html',
  styleUrl: './new-epics.component.css',
})
export class NewEpicsComponent implements OnDestroy {
  private readonly epicServices = inject(EpicsService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly membersService = inject(MembersService);
  private readonly route = inject(Router);
  successMessage = signal<string>('');
  allMembers = signal<Member[] | null>(null);
  projectId = signal<string>('');
  private destroy$ = new Subject<void>();
  // form
  today = new Date().toISOString().split('T')[0];
  private readonly fb = inject(FormBuilder);
  constructor() {
    this.activateRoute.paramMap.subscribe((param) => {
      this.projectId.set(param.get('projectId')!);
      this.addNewEpics.patchValue({ project_id: this.projectId() });
      this.getAllMembers();
    });
  }
  addNewEpics = this.fb.group({
    title: [null, [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.maxLength(500)],
    assignee_id: [null],
    project_id: [''],
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
    this.successMessage.set('');
    if (this.addNewEpics.valid) {
      this.epicServices.addNewEpics(this.addNewEpics.value).subscribe({
        next: (resp) => {
          console.log(resp);
          this.successMessage.set('Your epic has been created successfully.');
          this.addNewEpics.reset();
          interval(1000)
            .pipe(take(3))
            .subscribe(() => {
              this.successMessage.set('');
              this.route.navigateByUrl(`/project/${this.projectId()}/epics`);
            });
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.successMessage.set(error.error.msg);
        },
      });
    }
  }

  getAllMembers() {
    this.membersService
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
