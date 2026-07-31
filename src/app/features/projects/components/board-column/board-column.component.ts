import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { CardTaskViewComponent } from '../card-task-view/card-task-view.component';
import { ITask, ITaskStatusConfig } from '../../interfaces/ITask';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskDetailsPageComponent } from '../../pages/task-details-page/task-details-page.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CardTaskViewComponent, TaskDetailsPageComponent],
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

  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef); // 👈 جديد

  readonly limit = 5;
  page = signal(1);
  offset = signal(0);

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
    // مفيش داعي لـ loadTasks(false) هنا لوحدها؛ الاشتراك تحت بيعمل أول تحميل تلقائيًا
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        map(([, queryParams]) => ({
          offset: +(queryParams.get('offset') ?? 0),
          search: queryParams.get('search') ?? '',
        })),
        distinctUntilChanged((a, b) => a.offset === b.offset && a.search === b.search),
        takeUntilDestroyed(this.destroyRef) // 👈 بنبعت الـ destroyRef صراحةً
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

    this.projectsService.getTasksByStatus(
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

  taskDetails = signal<ITask | null>(null);
  showDetails = this.projectsService.showTaskDetails;

  getTaskDetails(projectId: string, taskId: string) {
    this.projectsService.getTaskDetails(projectId, taskId).subscribe({
      next: (resp) => {
        this.taskDetails.set(resp[0]);
        this.showDetails.set(true);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
}
