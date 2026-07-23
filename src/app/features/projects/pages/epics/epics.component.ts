import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardEpicComponent } from '../../components/card-epic/card-epic.component';
import { combineLatest, distinctUntilChanged, filter, map, Subject, tap, debounceTime } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { ViewportScroller } from '@angular/common';
import { EpicSkelltoneComponent } from '../../components/epic-skelltone/epic-skelltone.component';
import { EmptyEpicsComponent } from '../../components/empty-epics/empty-epics.component';

import { HandleErrorComponent } from '../../components/handle-error/handle-error.component';
import { HttpErrorResponse } from '@angular/common/http';
import { EpicDetailsPopupComponent } from '../epic-details-popup/epic-details-popup.component';

@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ReactiveFormsModule,
    RouterLink,
    CardEpicComponent,
    EpicSkelltoneComponent,
    EmptyEpicsComponent,
    HandleErrorComponent,
    EpicDetailsPopupComponent,
  ],
  templateUrl: './epics.component.html',
  styleUrl: './epics.component.css',
})
export class EpicsComponent {
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  showPoupDetail = this.projectsService.showPoupDetail;
  private readonly viewPortScroller = inject(ViewportScroller);
  private readonly router = inject(Router);
  private destroy$ = new Subject<void>();
  epic = this.projectsService.epic;
  projectId = signal<string>('');
  epicTasks = this.projectsService.epicTasks;

  arrPaths = computed(() => [
    {
      label: 'Epics',
      path: `/project/${this.projectId()}/epics`,
    },
  ]);

  page = signal(1);
  limit = signal(6);

  // --- Search ---
  searchControl = new FormControl<string>('', { nonNullable: true });
  searchTerm = signal<string>('');

  get isSearching(): boolean {
    return this.searchTerm().trim().length > 0;
  }

  allEpics = this.projectsService.allEpics;
  totalCount = this.projectsService.totalCountEpics;
  hasError = this.projectsService.epicsError;
  isLoading = this.projectsService.epicsIsLoadding;

  isMobile = signal(window.innerWidth < 1024);
  selectedProjectId = signal<string | null>(null);

  constructor() {
    combineLatest([this.activateRoute.paramMap, this.activateRoute.queryParamMap])
      .pipe(
        tap(([params, queryParams]) => {
          this.projectId.set(params.get('projectId')!);
          this.selectedProjectId.set(queryParams.get('projectId'));

          // keep the input synced with the URL (e.g. back/forward nav)
          // without re-triggering the debounced navigate below
          const searchFromUrl = queryParams.get('search') ?? '';
          if (this.searchControl.value !== searchFromUrl) {
            this.searchControl.setValue(searchFromUrl, { emitEvent: false });
          }
        }),
        map(([, queryParams]) => ({
          offset: +(queryParams.get('offset') ?? 0),
          search: queryParams.get('search') ?? '',
        })),
        distinctUntilChanged((a, b) => a.offset === b.offset && a.search === b.search),
        filter(() => !!this.projectId())
      )
      .subscribe(({ offset, search }) => {
        this.page.set(offset / this.limit() + 1);
        this.searchTerm.set(search);
        this.getAllEpics();
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.router.navigate([], {
          queryParams: {
            search: term.trim() ? term.trim() : null,
            offset: 0,
          },
          queryParamsHandling: 'merge',
        });
      });
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

      this.getAllEpics(); // append = false
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

      this.projectsService.getAllEpics(
        this.limit(),
        this.page(),
        true,
        this.projectId(),
        this.searchTerm()
      );
    }
  }

  getAllEpics() {
    this.projectsService.getAllEpics(
      this.limit(),
      this.page(),
      false,
      this.projectId(),
      this.searchTerm()
    );
  }

  clearSearch(): void {
    this.searchControl.setValue('');
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
  // epicsDetails
  epicsDetails(projectId: string, epicId: string) {
    this.projectsService.getEpicsDetails(projectId, epicId).subscribe({
      next: (resp) => {
        console.log(resp);
        this.epic.set(resp[0]);
        console.log(this.epic());

        this.showPoupDetail.set(true);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
  // get epic Tasks
  getEpicTasks(epicId: string) {
    this.projectsService.isLoadingEpicTask.set(true);
    this.projectsService.hasErrorEpicTask.set(false);
    this.projectsService
      .getEpicTasks(epicId)
      .pipe()
      .subscribe({
        next: (resp) => {
          this.epicTasks.set(resp);
          this.projectsService.isLoadingEpicTask.set(false);
          this.projectsService.hasErrorEpicTask.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.projectsService.isLoadingEpicTask.set(false);
          this.projectsService.hasErrorEpicTask.set(true);
        },
      });
  }
}
