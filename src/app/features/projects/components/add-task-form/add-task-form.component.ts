import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { Member } from '../../interfaces/IMembers';
import { interval, Subject, take, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { IEpicsProject } from '../../interfaces/IEpicsProject';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';
import { ToastMassageComponent } from '../toast-massage/toast-massage.component';

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
  private readonly projectServices = inject(ProjectsService);
  private readonly route = inject(Router);
  successMessage = signal<string>('');
  allMembers = signal<Member[] | null>(null);
  allEpics = this.projectServices.epics;

  private destroy$ = new Subject<void>();
  projectId = signal<string>('');
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => {
      this.projectId.set(param.get('projectId')!);
      this.getAllMembers();
      this.projectServices.getEpicsProject(this.projectId());
    });
  }
  addNewTask = this.fb.group({
    project_id: [sessionStorage.getItem(StORED_KEYS.projectId), Validators.required],
    epic_id: [null],
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
  createNewTask() {
    console.log(this.addNewTask.value);
    this.successMessage.set('');
    if (this.addNewTask.valid) {
      this.projectServices.createNewtTask(this.addNewTask.value).subscribe({
        next: (resp) => {
          console.log(resp);
          this.successMessage.set('Your epic has been created successfully.');
          interval(1000)
            .pipe(take(3))
            .subscribe(() => {
              this.successMessage.set('');
              this.route.navigateByUrl(`/project/${this.projectId()}/tasks`);
            });
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.successMessage.set('');
        },
      });
    }
  }
}
