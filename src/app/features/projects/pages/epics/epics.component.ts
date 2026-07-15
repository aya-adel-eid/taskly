import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RusableInputComponent } from '../../../auth/components/rusable-input/rusable-input.component';
import { CardEpicComponent } from '../../components/card-epic/card-epic.component';
import { combineLatest, distinctUntilChanged, filter, map, Subject, tap } from 'rxjs';
import { ProjectsService } from '../../services/projects.service';
import { ViewportScroller } from '@angular/common';
import { EpicSkelltoneComponent } from '../../components/epic-skelltone/epic-skelltone.component';
import { EmptyEpicsComponent } from '../../components/empty-epics/empty-epics.component';
import { IEpicsProject } from '../../interfaces/IEpicsProject';
import { HandleErrorComponent } from '../../components/handle-error/handle-error.component';

@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    RusableInputComponent,
    RouterLink,
    CardEpicComponent,
    EpicSkelltoneComponent,
    EmptyEpicsComponent,
    HandleErrorComponent,
  ],
  templateUrl: './epics.component.html',
  styleUrl: './epics.component.css',
})
export class EpicsComponent {
  private readonly activateRoute = inject(ActivatedRoute);
  projectId = signal<string>('');
  // ngOnInit(): void {
  //   this.activateRoute.paramMap.subscribe((param) => {
  //     this.projectId.set(param.get('projectId')!);
  //     this.getAllEpics();
  //   });
  // }
  arrPaths = computed(() => [
    {
      label: 'Epics',
      path: `/project/${this.projectId()}/epics`,
    },
  ]);

  //
  private readonly projectsService = inject(ProjectsService);

  private readonly viewPortScroller = inject(ViewportScroller);
  private readonly router = inject(Router);
  private destroy$ = new Subject<void>();

  page = signal(1);
  limit = signal(6);

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
        }),
        map(([, queryParams]) => +(queryParams.get('offset') ?? 0)),
        distinctUntilChanged(),
        filter(() => !!this.projectId())
      )
      .subscribe((offset) => {
        this.page.set(offset / this.limit() + 1);
        this.getAllEpics();
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
    // يشتغل على الموبايل فقط
    if (!this.isMobile()) return;

    // لو لسه بيحمل بيانات
    if (this.isLoading()) return;

    const reachedBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;

    if (reachedBottom && this.page() < this.pages.length) {
      this.page.update((p) => p + 1);

      this.projectsService.getAllEpics(this.limit(), this.page(), true, this.projectId());
    }
  }

  getAllEpics() {
    this.projectsService.getAllEpics(this.limit(), this.page(), false, this.projectId());
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
}
