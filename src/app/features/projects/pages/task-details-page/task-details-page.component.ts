import { Component, effect, inject, input, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ITask } from '../../interfaces/ITask';
import { IEpicTasks } from '../../interfaces/IEpicTasks';
import { ProjectsService } from '../../services/projects.service';
import { Subject, takeUntil } from 'rxjs';
import { Member } from '../../interfaces/IMembers';
import { IEpicsProject } from '../../interfaces/IEpicsProject';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-task-details-page',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './task-details-page.component.html',
  styleUrl: './task-details-page.component.css',
})
export class TaskDetailsPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly projectServices = inject(ProjectsService);

  task = input<ITask>();

  private destroy$ = new Subject<void>();

  // Epic dropdown state
  isEditingEpic = signal(false);
  currentEpic = signal<IEpicsProject | null>(null);
  allEpics = this.projectServices.epics;

  // Assignee dropdown state
  isEditingAssignee = signal(false);
  currentAssignee = signal<Member | null>(null);
  allMembers = signal<Member[]>([]);

  // Status dropdown state
  selectedStatus = signal<string>('');
  statues: { value: string; title: string }[] = [
    { value: 'TO_DO', title: 'To Do' },
    { value: 'IN_PROGRESS', title: 'IN PROGRESS' },
    { value: 'BLOCKED', title: 'BLOCKED' },
    { value: 'IN_REVIEW', title: 'IN REVIEW' },
    { value: 'READY_FOR_QA', title: 'READY FOR QA' },
    { value: 'REOPENED', title: 'REOPENED' },
    { value: 'READY_FOR_PRODUCTION', title: 'READY FOR PRODUCTION' },
    { value: 'DONE', title: 'DONE' },
  ];

  taskDetails = this.fb.group({
    title: [''],
    assignee_id: [''],
    due_date: [''],
    epic_id: [''],
    status: [''],
    description: [''],
  });

  constructor() {
    // بس الـ status محتاج effect لأنه مش مرتبط بـ API call زي الـ assignee
    effect(() => {
      this.selectedStatus.set(this.task()?.status ?? '');
    });
  }

  ngOnInit() {
    if (this.task()) {
      const taskData = this.task();
      this.taskDetails.patchValue({
        title: this.task()?.title ?? '',
        description: this.task()?.description ?? '',
        assignee_id: this.task()?.assignee?.id ?? '',
        epic_id: this.task()?.epic?.id ?? '',
        status: this.task()?.status ?? 'TO_DO',
       due_date: this.formatDateForInput(taskData?.due_date!)
      });
    }

    this.getEpicsProject();
    this.getAllMembers();
  }
 formatDateForInput(dateString: string | Date | undefined) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return ''; // لو التاريخ مش صالح
  
  // استخراج السنة، الشهر، واليوم بصيغة YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
  getEpicsProject() {
    this.projectServices
      .getEpicsProject(this.task()?.project_id!)
  }

  getAllMembers() {
    this.projectServices
      .getAllMembers(this.task()?.project_id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          this.allMembers.set(resp);
          const assignee = resp.find((m) => m.user_id === this.task()?.assignee?.id);
          this.currentAssignee.set(assignee ?? null);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  selectAssignee(member: Member | null) {
    this.currentAssignee.set(member);
    this.isEditingAssignee.set(false);
    this.taskDetails.patchValue({ assignee_id: member?.user_id ?? '' });

    // لو محتاج تبعت التغيير للـ API فورًا لاحقًا:
    // this.taskService.updateTask(this.task()!.task_id, {
    //   assignee_id: member?.user_id ?? null
    // });
  }

  selectEpic(epic: IEpicsProject | null) {
    this.currentEpic.set(epic);
    this.isEditingEpic.set(false);
    this.taskDetails.patchValue({ epic_id: epic?.id ?? '' });
  }

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.taskDetails.patchValue({ status: value });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.assignee-dropdown')) {
      this.isEditingAssignee.set(false);
    }
    if (!target.closest('.epic-dropdown')) {
      this.isEditingEpic.set(false);
    }
  }

  close() {
   this.projectServices.showTaskDetails.set(!this.projectServices.showTaskDetails())
   console.log('flase');
   
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}