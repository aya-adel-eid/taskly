import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CardTaskViewComponent } from '../card-task-view/card-task-view.component';
import { ITask, ITaskStatusConfig } from '../../interfaces/ITask';
import { ProjectsService } from '../../services/projects.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ToastMassageComponent } from '../toast-massage/toast-massage.component';
@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CardTaskViewComponent, ToastMassageComponent],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.css',
})
export class BoardColumnComponent implements OnInit {
  projectId = input.required<string>();

  statu = input.required<ITaskStatusConfig>();

  errorMessage = signal<string>('');

  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  // ---------- Drag state  ----------
  draggedTask = this.projectsService.draggedTask;
  draggedFromStatus = this.projectsService.draggedFromStatus;
  dragOverStatus = this.projectsService.dragOverStatus;

  readonly limit = 5;
  page = signal(1);

  tasks = computed(() => this.projectsService.tasksByStatus()[this.statu().value] ?? null);
  totalCount = computed(
    () => this.projectsService.tasksByStatusTotalCount()[this.statu().value] ?? 0
  );
  isLoading = computed(
    () => this.projectsService.tasksByStatusLoading()[this.statu().value] ?? false
  );
  hasError = computed(() => this.projectsService.tasksByStatusError()[this.statu().value] ?? false);

  get hasMore(): boolean {
    return (this.tasks()?.length ?? 0) < this.totalCount();
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(append = false): void {
    this.projectsService.getTasksByStatus(
      this.projectId(),
      this.statu().value,
      this.limit,
      this.page(),
      append
    );
  }

  onScroll(event: Event): void {
    if (this.isLoading() || !this.hasMore) return;

    const el = event.target as HTMLElement;
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;

    if (reachedBottom) {
      this.page.update((p) => p + 1);
      this.loadTasks(true); // append = true
    }
  }

  addTask(): void {
    this.router.navigate(['/project', this.projectId(), 'tasks', 'new'], {
      queryParams: { status: this.statu().value },
    });
  }

  // ---------- Drag events ----------
  onDragStart(task: ITask, fromStatus: string): void {
    this.draggedTask.set(task);
    this.draggedFromStatus.set(fromStatus);
  }

  onDragEnd(): void {
    this.draggedTask.set(null);
    this.draggedFromStatus.set(null);
    this.dragOverStatus.set(null);
  }

  onDragOverColumn(event: DragEvent, status: string): void {
    event.preventDefault(); // لازم عشان الـ (drop) يشتغل أصلاً
    this.dragOverStatus.set(status);
  }

  onDragLeaveColumn(): void {
    this.dragOverStatus.set(null);
  }

  onDropColumn(event: DragEvent, targetStatus: string): void {
    event.preventDefault();

    const task = this.draggedTask();
    const fromStatus = this.draggedFromStatus();

    this.dragOverStatus.set(null);

    if (!task || !fromStatus || fromStatus === targetStatus) {
      this.onDragEnd();
      return;
    }

    const oldStatus = fromStatus;

    //  Optimistic update
    this.projectsService.tasksByStatus.update((byStatus) => {
      const fromList = (byStatus[oldStatus] ?? []).filter((t) => t.id !== task.id);
      const toList = [
        ...(byStatus[targetStatus] ?? []),
        { ...task, status: targetStatus as ITask['status'] },
      ];

      return {
        ...byStatus,
        [oldStatus]: fromList,
        [targetStatus]: toList,
      };
    });

    //call api
    this.projectsService.updateTask({ status: targetStatus }, task.id).subscribe({
      next: () => {
        this.errorMessage.set('');
      },
      error: (error: HttpErrorResponse) => {
        this.projectsService.tasksByStatus.update((byStatus) => {
          const toList = (byStatus[targetStatus] ?? []).filter((t) => t.id !== task.id);
          const fromList = [
            ...(byStatus[oldStatus] ?? []),
            { ...task, status: oldStatus as ITask['status'] },
          ];

          return {
            ...byStatus,
            [targetStatus]: toList,
            [oldStatus]: fromList,
          };
        });

        this.errorMessage.set('Failed to update task status. Please try again.');
      },
    });

    this.onDragEnd();
  }
}
