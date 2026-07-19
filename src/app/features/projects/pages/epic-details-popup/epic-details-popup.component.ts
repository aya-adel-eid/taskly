import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { IEpicsProject } from '../../interfaces/IEpicsProject';
import { Member } from '../../interfaces/IMembers';
import { DatePipe } from '@angular/common';
import { IEpicDetails } from '../../interfaces/IEpicDetails';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { RouterLink } from '@angular/router';
import { IEpicTasks } from '../../interfaces/IEpicTasks';

@Component({
  selector: 'app-epic-details-popup',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './epic-details-popup.component.html',
  styleUrl: './epic-details-popup.component.css',
})
export class EpicDetailsPopupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectsService);

  epic = input.required<IEpicDetails>();
  allMembers = signal<Member[]>([]);

  private destroy$ = new Subject<void>();
  projectId = signal<string>('');

  epicTasks = input<IEpicTasks[]>([]);

  isEditingAssignee = signal(false);

  epicForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    deadline: [''],
    assignee_id: [null as string | null],
  });

  ngOnInit(): void {
    this.epicForm.patchValue({
      title: this.epic().title,
      description: this.epic().description ?? 'No description provided',
      deadline: this.epic().deadline ?? '',
      assignee_id: this.epic().assignee.sub ?? 'Unassigned',
    });

    this.getAllMembers();
  }

  // ---------- Title ----------
  onTitleBlur() {
    const control = this.epicForm.get('title')!;

    if (control.invalid) {
      control.setValue(this.epic().title);
      return;
    }

    const newValue = control.value!.trim();
    if (newValue !== this.epic().title) {
      this.updateEpic({ title: newValue }, 'title', this.epic().title);
    }
  }

  // ---------- Description ----------
  onDescriptionBlur() {
    const control = this.epicForm.get('description')!;
    const newValue = control.value?.trim() ?? '';

    if (newValue !== (this.epic().description ?? '')) {
      this.updateEpic({ description: newValue || null }, 'description', this.epic().description);
    }
  }

  // ---------- Assignee ----------
  onAssigneeChange() {
    const control = this.epicForm.get('assignee_id')!;
    const newAssigneeId = control.value;
    const oldAssigneeId = this.epic().assignee.sub;

    this.isEditingAssignee.set(false);

    if (newAssigneeId !== oldAssigneeId) {
      this.updateEpic({ assignee_id: newAssigneeId }, 'assignee_id', oldAssigneeId);
    }
  }

  // ---------- Deadline ----------
  onDeadlineChange() {
    const control = this.epicForm.get('deadline')!;
    const newValue = control.value || null;

    if (newValue !== (this.epic().deadline ?? null)) {
      this.updateEpic({ deadline: newValue }, 'deadline', this.epic().deadline);
    }
  }

  // ---------- Generic update + rollback ----------
  updateEpic(partial: Record<string, any>, field: string, oldValue: any) {
    this.projectService.updateEpic(partial, this.epic().id).subscribe({
      next: () => {
        this.projectService.patchLocalEpic(this.epic().id, partial);
      },
      error: () => {
        this.epicForm.get(field)?.setValue(oldValue ?? (field === 'assignee_id' ? null : ''));
        // this.toastService.error('Failed to update epic. Please try again.');
      },
    });
  }

  closeModal() {
    this.projectService.showPoupDetail.set(false);
  }

  addTask() {
    // منطقك بتاع إضافة تاسك
  }
  selectAssignee(member: Member | null) {
    const newAssigneeId = member?.user_id ?? null;
    const oldAssigneeId = this.epic().assignee?.sub ?? null;

    this.isEditingAssignee.set(false);

    if (newAssigneeId !== oldAssigneeId) {
      this.updateEpic({ assignee_id: newAssigneeId }, 'assignee_id', oldAssigneeId);

      this.projectService.patchLocalEpic(this.epic().id, {
        assignee: member
          ? {
              sub: member.user_id,
              name: member.metadata.name,
              email: member.metadata.email,
              department: member.metadata.department,
            }
          : undefined,
      });
    }
  }

  getInitials(name?: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  getAllMembers() {
    this.projectService
      .getAllMembers(this.epic().project_id)
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
