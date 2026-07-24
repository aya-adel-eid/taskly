import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  imports: [RouterLink],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

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
