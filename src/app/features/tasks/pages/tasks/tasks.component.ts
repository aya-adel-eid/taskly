import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardViewComponent } from '../board-view/board-view.component';
import { ListViewComponent } from '../list-view/list-view.component';

import { DatePipe } from '@angular/common';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
type TasksView = 'list' | 'board';

interface IViewOption {
  value: TasksView;
  label: string;
}

interface IBoardStatusConfig {
  label: string;
  status: string;
  dotColor: string;
}
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    RouterLink,
    BoardViewComponent,
    ListViewComponent,
    DatePipe,
    BreadcrumbComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  searchControl = new FormControl<string>('', { nonNullable: true });

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
    { value: 'list', label: 'List ' },
    { value: 'board', label: 'Board ' },
  ];
  selectedView = signal<TasksView>('board'); // default per spec
  isViewMenuOpen = signal(false);

  // --- board columns config ---

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

    // search
    const initialSearch = this.route.snapshot.queryParamMap.get('search') ?? '';
    this.searchControl.setValue(initialSearch, { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            search: term.trim() ? term.trim() : null,
            offset: 0,
          },
          queryParamsHandling: 'merge',
        });
      });
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
}
