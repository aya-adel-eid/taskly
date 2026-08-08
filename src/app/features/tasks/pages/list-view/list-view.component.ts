import { Component, HostListener, inject, signal } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { combineLatest, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { TaskDetailsPageComponent } from '../task-details-page/task-details-page.component';
import { ITask } from '../../interfaces/ITask';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TasksService } from '../../services/tasks.service';
import { SharedServiceService } from '../../../../shared/shared-service.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [DatePipe, TaskDetailsPageComponent, RouterLink, PaginationComponent],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css',
})
export class ListViewComponent {
  projectId = signal<string>('');
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  sharedService = inject(SharedServiceService);
  private readonly tasksService = inject(TasksService);

  allTasks = this.tasksService.allTasks;
  totalCount = this.tasksService.totalCountTasks;
  hasError = this.tasksService.tasksError;
  isLoading = this.tasksService.tasksIsLoading;

  page = signal(1);
  limit = signal(5);
  isMobile = signal(window.innerWidth < 1024);

  // --- Search Signals ---
  searchTerm = signal<string>('');

  get isSearching(): boolean {
    return this.searchTerm().trim().length > 0;
  }

  taskDetails = signal<ITask | null>(null);
  showDetails = this.tasksService.showTaskDetails;

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        tap(([params]) => {
          this.projectId.set(params.get('projectId')!);
        }),

        map(([, queryParams]) => ({
          offset: +(queryParams.get('offset') ?? 0),
          search: queryParams.get('search') ?? '',
        })),

        distinctUntilChanged((a, b) => a.offset === b.offset && a.search === b.search),
        filter(() => !!this.projectId()),
        takeUntilDestroyed()
      )
      .subscribe(({ offset, search }) => {
        this.page.set(Math.floor(offset / this.limit()) + 1);
        this.searchTerm.set(search);

        this.getAllTasks();
      });
  }

  getAllTasks(append = false) {
    this.tasksService.getAllTasks(
      this.projectId(),
      this.limit(),
      this.page(),
      append,
      this.searchTerm() // تمرير كلمة البحث للسيرفيس
    );
  }

  changePage(page: number) {
    this.page.set(page);

    this.router.navigate([], {
      queryParams: {
        offset: (page - 1) * this.limit(),
      },
      queryParamsHandling: 'merge',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  get pages(): number[] {
    return Array.from({ length: Math.ceil(this.totalCount() / this.limit()) }, (_, i) => i + 1);
  }

  @HostListener('window:resize')
  onResize() {
    const wasMobile = this.isMobile();
    this.isMobile.set(window.innerWidth < 1024);
    const isNowDesktop = wasMobile && !this.isMobile();

    if (isNowDesktop) {
      this.page.set(1);

      this.router.navigate([], {
        queryParams: { offset: 0 },
        queryParamsHandling: 'merge',
      });

      this.getAllTasks(false); // append = false
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isMobile()) return;

    if (this.isLoading()) return;

    const reachedBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;

    if (reachedBottom && this.page() < this.pages.length) {
      this.page.update((p) => p + 1);

      this.getAllTasks(true);
    }
  }

  getTaskDetails(projectId: string, taskId: string) {
    this.tasksService.getTaskDetails(projectId, taskId).subscribe({
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
