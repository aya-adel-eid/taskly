import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { CardTaskViewComponent } from '../card-task-view/card-task-view.component';
import { ITask, ITaskStatusConfig } from '../../interfaces/ITask';
import { ProjectsService } from '../../../projects/services/projects.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { ToastMassageComponent } from '../../../../shared/components/toast-massage/toast-massage.component';
import { TasksService } from '../../services/tasks.service';

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

  // Search
  searchTerm = signal<string>('');
  get isSearching(): boolean {
    return this.searchTerm().trim().length > 0;
  }

  errorMessage = signal<string>('');

  private tasksService = inject(TasksService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // ---------- Drag state ----------
  draggedTask = this.tasksService.draggedTask;
  draggedFromStatus = this.tasksService.draggedFromStatus;
  dragOverStatus = this.tasksService.dragOverStatus;

  readonly limit = 5;
  page = signal(1);
  offset = signal(0);

  tasks = computed(() => this.tasksService.tasksByStatus()[this.statu().value] ?? null);
  totalCount = computed(() => this.tasksService.tasksByStatusTotalCount()[this.statu().value] ?? 0);
  isLoading = computed(() => this.tasksService.tasksByStatusLoading()[this.statu().value] ?? false);
  hasError = computed(() => this.tasksService.tasksByStatusError()[this.statu().value] ?? false);

  get hasMore(): boolean {
    return (this.tasks()?.length ?? 0) < this.totalCount();
  }

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        map(([, queryParams]) => ({
          offset: +(queryParams.get('offset') ?? 0),
          search: queryParams.get('search') ?? '',
        })),
        distinctUntilChanged((a, b) => a.offset === b.offset && a.search === b.search),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ offset, search }) => {
        this.page.set(Math.floor(offset / this.limit) + 1);
        this.offset.set(offset);
        this.searchTerm.set(search);

        this.loadTasks(false);
      });
  }

  loadTasks(append = false): void {
    if (!this.projectId()) return;

    this.tasksService.getTasksByStatus(
      this.projectId(),
      this.statu().value,
      this.limit,
      this.page(),
      append,
      this.searchTerm()
    );
  }

  onScroll(event: Event): void {
    if (this.isLoading() || !this.hasMore) return;

    const el = event.target as HTMLElement;
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;

    if (reachedBottom) {
      this.page.update((p) => p + 1);
      this.loadTasks(true);
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
    event.preventDefault();
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

    // Optimistic update
    this.tasksService.tasksByStatus.update((byStatus) => {
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

    // call api
    this.tasksService.updateTask({ status: targetStatus }, task.id).subscribe({
      next: () => {
        this.errorMessage.set('');
      },
      error: (error: HttpErrorResponse) => {
        this.tasksService.tasksByStatus.update((byStatus) => {
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
