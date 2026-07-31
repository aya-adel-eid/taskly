import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardViewComponent } from '../board-view/board-view.component';
import { ListViewComponent } from '../list-view/list-view.component';
// import { ProjectsService } from '../../services/projects.service';
// import { combineLatest, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
type TasksView = 'list' | 'board';

interface IViewOption {
  value: TasksView;
  label: string;
}

interface IBoardStatusConfig {
  label: string;
  status: string; // TODO: match exactly to your backend's status enum values
  dotColor: string;
}
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterLink, BoardViewComponent, ListViewComponent, DatePipe, BreadcrumbComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  searchValue = signal<string>('');
  activeSearchTerm = signal<string>('');
  arrPaths = computed(() => [
    {
      label: 'Tasks',
      path: `/project/${this.projectId()}/tasks`,
    },
  ]);

  projectId = signal<string>('');

  // --- view switcher state (was app-view-switcher, now inline) ---
  viewOptions: IViewOption[] = [
    { value: 'list', label: 'List View' },
    { value: 'board', label: 'Board View' },
  ];
  selectedView = signal<TasksView>('board'); // default per spec
  isViewMenuOpen = signal(false);

  // --- board columns config ---
  // TODO: confirm the exact `status` values your API expects (case/format)
  columns: IBoardStatusConfig[] = [
    { label: 'TO DO', status: 'TO_DO', dotColor: '#737685' },
    { label: 'IN PROGRESS', status: 'IN_PROGRESS', dotColor: '#2F6FED' },
    { label: 'BLOCKED', status: 'BLOCKED', dotColor: '#E0433C' },
    { label: 'IN REVIEW', status: 'IN_REVIEW', dotColor: '#7C5CFC' },
    { label: 'READY FOR QA', status: 'READY_FOR_QA', dotColor: '#12B3A8' },
    { label: 'REOPENED', status: 'REOPENED', dotColor: '#FF8A5C' },
    { label: 'READY FOR PRODUCTION', status: 'READY_FOR_PRODUCTION', dotColor: '#5C7CFC' },
    { label: 'DONE', status: 'DONE', dotColor: '#1A9D5C' },
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.projectId.set(params.get('projectId')!);
    });

    const viewFromUrl = this.route.snapshot.queryParamMap.get('view');
    this.selectedView.set(viewFromUrl === 'list' ? 'list' : 'board');
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.activeSearchTerm.set(term);
      });
  }
  // search
  onSearchChange(value: string): void {
    this.searchValue.set(value);
    this.searchInput$.next(value);
  }
  get selectedViewLabel(): string {
    return this.viewOptions.find((o) => o.value === this.selectedView())?.label ?? '';
  }

  toggleViewMenu(): void {
    this.isViewMenuOpen.update((open) => !open);
  }

  selectView(view: TasksView): void {
    this.selectedView.set(view);
    this.isViewMenuOpen.set(false);

    this.router.navigate([], {
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }

  viewOptionClasses(value: TasksView): string {
    return value === this.selectedView()
      ? 'bg-[#003D9B] text-white'
      : 'text-[#434654] hover:bg-gray-50';
  }

  // close the view-switcher dropdown on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isViewMenuOpen.set(false);
    }
  }

  // projectservice = inject(ProjectsService);

  // allTasks = this.projectservice.allTasks;
  // totalCount = this.projectservice.totalCountTasks;
  // hasError = this.projectservice.tasksError;
  // isLoading = this.projectservice.tasksIsLoading;
  // page = signal(1);
  // limit = signal(5);
  // isMobile = signal(window.innerWidth < 1024);

  // constructor() {
  //   combineLatest([this.route.paramMap, this.route.queryParamMap])
  //     .pipe(
  //       tap(([params]) => {
  //         // projectId is a route param (/project/:projectId/tasks), not a query param
  //         this.projectId.set(params.get('projectId')!);
  //       }),
  //       map(([, queryParams]) => +(queryParams.get('offset') ?? 0)),
  //       distinctUntilChanged(),
  //       filter(() => !!this.projectId())
  //     )
  //     .subscribe((offset) => {
  //       this.page.set(offset / this.limit() + 1);
  //       this.getAllTasks();
  //     });
  // }

  // getAllTasks() {
  //   this.projectservice.getAllTasks(this.projectId(), this.limit(), this.page(), false);
  // }

  // changePage(page: number) {
  //   this.page.set(page);

  //   this.router.navigate([], {
  //     queryParams: {
  //       offset: (page - 1) * this.limit(),
  //     },
  //     queryParamsHandling: 'merge',
  //   });

  //   window.scrollTo({
  //     top: 0,
  //     behavior: 'smooth',
  //   });
  // }

  // get pages(): number[] {
  //   return Array.from({ length: Math.ceil(this.totalCount() / this.limit()) }, (_, i) => i + 1);
  // }

  // @HostListener('window:resize')
  // onResize() {
  //   const wasMobile = this.isMobile();
  //   this.isMobile.set(window.innerWidth < 1024);
  //   const isNowDesktop = wasMobile && !this.isMobile();

  //   if (isNowDesktop) {
  //     this.page.set(1);

  //     this.router.navigate([], {
  //       queryParams: { offset: 0 },
  //       queryParamsHandling: 'merge',
  //     });

  //     this.getAllTasks(); // append = false
  //   }
  // }

  // @HostListener('window:scroll')
  // onScroll() {
  //   // يشتغل على الموبايل فقط
  //   if (!this.isMobile()) return;

  //   // لو لسه بيحمل بيانات
  //   if (this.isLoading()) return;

  //   const reachedBottom =
  //     window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;

  //   if (reachedBottom && this.page() < this.pages.length) {
  //     this.page.update((p) => p + 1);

  //     this.projectservice.getAllTasks(
  //       this.projectId(),
  //       this.limit(),
  //       this.page(),
  //       true // append
  //     );
  //   }
  // }
}
