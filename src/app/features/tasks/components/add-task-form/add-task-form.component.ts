import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Member } from '../../../members/interfaces/IMembers';
import { interval, Subject, take, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ToastMassageComponent } from '../../../../shared/components/toast-massage/toast-massage.component';
import { MembersService } from '../../../members/services/members.service';
import { EpicsService } from '../../../epics/services/epics.service';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-add-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ToastMassageComponent],
  templateUrl: './add-task-form.component.html',
  styleUrl: './add-task-form.component.css',
})
export class AddTaskFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly activateRoute = inject(ActivatedRoute);

  private readonly memberService = inject(MembersService);
  private readonly epicService = inject(EpicsService);
  private readonly tasksService = inject(TasksService);
  epic_Id = signal<string | null>(null);
  status = signal<string>('');
  private readonly route = inject(Router);
  successMessage = signal<string>('');
  allMembers = signal<Member[] | null>(null);
  allEpics = this.epicService.epics;
  errorMessage = signal<string>('');

  private destroy$ = new Subject<void>();
  projectId = signal<string>('');
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => {
      this.projectId.set(param.get('projectId')!);
      this.addNewTask.patchValue({ project_id: this.projectId() });

      this.getAllMembers();
      this.epicService.getEpicsProject(this.projectId());
    });
    this.activateRoute.queryParamMap.subscribe((param) => {
      this.epic_Id.set(param.get('epicId')!);
      this.status.set(param.get('status')!);
    });

    if (this.status()) {
      this.addNewTask.patchValue({ status: this.status() });
    }
    if (this.epic_Id()) {
      this.addNewTask.patchValue({ epic_id: this.epic_Id() });
    }
  }
  addNewTask = this.fb.group({
    project_id: ['', Validators.required],
    epic_id: [null as string | null],
    title: [null, [Validators.required]],
    description: [null],
    assignee_id: [null],
    due_date: [null],
    status: ['TO_DO'],
  });
  statues = [
    {
      value: 'TO_DO',
      title: 'To Do',
    },
    {
      value: 'IN_PROGRESS',
      title: 'IN PROGRESS',
    },

    {
      value: 'BLOCKED',
      title: 'BLOCKED',
    },
    {
      value: 'IN_REVIEW',
      title: 'IN REVIEW',
    },
    {
      value: 'READY_FOR_QA',
      title: 'READY FOR QA',
    },
    {
      value: 'REOPENED',
      title: 'REOPENED',
    },
    {
      value: 'READY_FOR_PRODUCTION',
      title: 'READY FOR PRODUCTION',
    },
    {
      value: 'DONE',
      title: 'DONE',
    },
  ];
  truncate(title: string): string {
    return title.length > 100 ? title.slice(0, 100) + '...' : title;
  }
  getAllMembers() {
    this.memberService
      .getAllMembers(this.projectId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          this.allMembers.set(resp);
        },
        error: (error: HttpErrorResponse) => {},
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  createNewTask() {
    this.addNewTask.markAllAsTouched();
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.addNewTask.valid) {
      this.tasksService.createNewtTask(this.addNewTask.value).subscribe({
        next: (resp) => {
          this.successMessage.set('Your epic has been created successfully.');
          interval(1000)
            .pipe(take(3))
            .subscribe(() => {
              this.successMessage.set('');
              this.route.navigateByUrl(`/project/${this.projectId()}/tasks`);
            });
        },
        error: (error: HttpErrorResponse) => {
          this.successMessage.set('');
          this.errorMessage.set('Failed to add task. Please try again.');
        },
      });
    }
  }
}
