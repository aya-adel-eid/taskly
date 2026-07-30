import { Component, effect, inject, input, signal, OnInit, OnDestroy, HostListener, computed } from '@angular/core';
import { ITask } from '../../interfaces/ITask';
import { Epic, IEpicTasks } from '../../interfaces/IEpicTasks';
import { ProjectsService } from '../../services/projects.service';
import { Subject, takeUntil } from 'rxjs';
import { Member } from '../../interfaces/IMembers';
import { IEpicsProject } from '../../interfaces/IEpicsProject';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

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
todayDateString = new Date().toISOString().split('T')[0];
  task = input<ITask>();

  private destroy$ = new Subject<void>();

  // Epic dropdown state
  isEditingEpic = signal(false);
  // currentEpic = signal<Epic | null>(null);
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
    due_date: [null as string | null],
    epic_id: [''],
    status: [''],
    description: [''],
  });

  constructor() {

    effect(() => {
      this.selectedStatus.set(this.task()?.status ?? '');
      // this.currentEpic.set(this.task()?.epic??null)
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    if (this.task()) {
      console.log('current',this.task());
      
      const taskData = this.task();
      this.taskDetails.patchValue({
        title: this.task()?.title ?? '',
        description: this.task()?.description ?? '',
        assignee_id: this.task()?.assignee?.id ?? '',
        epic_id: this.task()?.epic?.id ?? '',
        status: this.task()?.status ?? 'TO_DO',
       due_date: this.formatDateForInput(taskData?.due_date!)
      });
      this.getEpicsProject();
      this.getAllMembers();
    }
    // 
    console.log('form detaisl',this.taskDetails.value);
    

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
   console.log('selectAssignee called with:', member);
    const control = this.taskDetails.get('assignee_id')!;

    const oldAssigneeId = control.value;
    const newAssigneeId = member?.user_id ?? null;

    if (oldAssigneeId === newAssigneeId) {
      this.isEditingAssignee.set(false);
      return;
    }

    control.setValue(newAssigneeId);
    this.isEditingAssignee.set(false);

    this.updateTask({ assignee_id: newAssigneeId }, 'assignee_id', oldAssigneeId);

    this.projectServices.patchLocalTask(this.task()?.id!, {
      assignee: member
        ? {
            id: member.user_id,
            name: member.metadata.name,
            email: member.metadata.email,
            department: member.metadata.department,
          }
        : null,   // ⬅️ null بدل undefined
    });
  }

//   selectEpic(epic: Epic | IEpicsProject | null) {
//   this.currentEpic.set(epic as Epic);
//   this.isEditingEpic.set(false);
//   this.taskDetails.patchValue({ epic_id: epic?.id ?? '' });
// }
selectEpic(epic: Epic | IEpicsProject | null) {
  const control = this.taskDetails.get('epic_id')!;

  const oldEpicId = control.value;
  const newEpicId = epic?.id ?? null;

  if (oldEpicId === newEpicId) {
    this.isEditingEpic.set(false);
    return;
  }

  control.setValue(newEpicId); // ⬅️ ده اللي هيخلي currentEpic (computed) تتحدث تلقائيًا
  this.isEditingEpic.set(false);

  this.updateTask({ epic_id: newEpicId }, 'epic_id', oldEpicId);

  this.projectServices.patchLocalTask(this.task()?.id!, {
    epic: epic
      ? { id: epic.id, epic_id: (epic as any).epic_id, title: epic.title }
      : null,
  });
}

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.taskDetails.patchValue({ status: value });
      const control = this.taskDetails.get('status')!;
    const newValue = control.value!;
    const oldValue = this.task()?.status;

    if (newValue !== oldValue) {
      this.updateTask({ status: newValue }, 'status', oldValue);
    }
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


//  update title
 onTitleBlur() {
  console.log('blur fired', this.taskDetails.get('title')?.value);
   console.log('🔵 onTitleBlur CALLED'); // ⬅️ ضيف السطر ده
  console.log('blur fired', this.taskDetails.get('title')?.value);
  const control = this.taskDetails.get('title')!;
  if (control.invalid) {
    control.setValue(this.task()?.title!);
    return;
  }
  const newValue = control.value!.trim();
  console.log('newValue:', newValue, 'oldValue:', this.task()?.title);
  
  if (newValue !== this.task()?.title) {
    this.updateTask({ title: newValue }, 'title', this.task()?.title);
  }
}
// update decript
 // ---------- Description ----------
  onDescriptionBlur() {
    const control = this.taskDetails.get('description')!;
    const newValue = control.value?.trim() ?? '';

    if (newValue !== (this.task()?.description ?? '')) {
      this.updateTask({ description: newValue || null }, 'description', this.task()?.description);
    }
  }
      // ---------- Assignee ----------

private assigneeIdValue = toSignal(
  this.taskDetails.get('assignee_id')!.valueChanges,
  { initialValue: this.taskDetails.get('assignee_id')!.value }
);

selectedAssignee = computed(() => {
  const assigneeId = this.assigneeIdValue();
  if (!assigneeId) return null;
  return this.allMembers().find((m) => m.user_id === assigneeId) ?? null;
});
// epic
private epicIdValue = toSignal(
  this.taskDetails.get('epic_id')!.valueChanges,
  { initialValue: this.taskDetails.get('epic_id')!.value }
);

currentEpic = computed(() => {
  const epicId = this.epicIdValue();
  if (!epicId) return null;
  return this.allEpics()?.find((e) => e.id === epicId) ?? null;
});
// due date
onDueDateChange() {
  const control = this.taskDetails.get('due_date')!;
  const newValue = control.value || null; 
  const oldValue = this.formatDateForInput(this.task()?.due_date!) || null;

  if (newValue === oldValue) return;

 
  if (newValue && newValue < this.todayDateString) {
    control.setValue(oldValue);
   
    return;
  }

 
  const payloadValue = newValue ? new Date(newValue).toISOString() : null;

  this.updateTask({ due_date: payloadValue }, 'due_date', oldValue);

  this.projectServices.patchLocalTask(this.task()?.id!, {
    due_date: payloadValue,
  });
}


  // ---------- Generic update + rollback ----------
  updateTask(partial: Record<string, any>, field: string, oldValue: any) {
    this.projectServices.updateTask(partial, this.task()?.id!).subscribe({
      next: () => {
        this.projectServices.patchLocalTask(this.task()?.id!, partial);
        console.log(partial);
        console.log(
          'done'
        );
        
        
      },
      error: () => {
        this.taskDetails.get(field)?.setValue(oldValue ?? (field === 'assignee_id' || field === 'epic_id' ? null : ''));
        // this.errorMessage.set('Failed to update task. Please try again.');
      },
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}