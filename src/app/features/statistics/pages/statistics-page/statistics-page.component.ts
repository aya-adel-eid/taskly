import { Component, computed, inject, signal } from '@angular/core';
import { ProjectsService } from '../../../projects/services/projects.service';
import { StatisticsService } from '../../services/statistics.service';
import { IProject } from '../../../projects/interfaces/Iprojects';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.css',
})
export class StatisticsPageComponent {
  private readonly projectService = inject(ProjectsService);
  statisticsService = inject(StatisticsService);

  // ---------- Projects ----------
  projects = signal<IProject[] | null>(null);

  ngOnInit(): void {
    this.getProjects();
    this.statisticsService.applyFiltersAndReload();
  }

  getProjects() {
    this.projectService.getProjects().subscribe({
      next: (resp) => {
        this.projects.set(resp);
      },
    });
  }

  // ---------- UI-only state (dropdown open/close) ----------
  isDatePickerOpen = signal(false);
  isProjectMenuOpen = signal(false);
  isStatusMenuOpen = signal(false);

  tempStartDate = signal<string>(this.statisticsService.startDate());
  tempEndDate = signal<string>(this.statisticsService.endDate());

  calendarViewDate = signal<Date>(new Date());

  // ---------- Computed labels ----------
  dateRangeLabel = this.statisticsService.dateRangeLabel;
  dateRangeError = this.statisticsService.dateRangeError;
  statusOptions = this.statisticsService.statusOptions;

  selectedProjectLabel = computed(() => {
    const id = this.statisticsService.selectedProjectId();
    if (!id) return 'All Active Projects';
    return this.projects()?.find((p) => p.id === id)?.name ?? 'All Projects';
  });

  selectedStatusLabel = computed(() => {
    const status = this.statisticsService.selectedStatus();
    if (!status) return 'All Status';
    return (
      this.statisticsService.statusOptions.find((s) => s.value === status)?.label ?? 'All Status'
    );
  });

  calendarDays = computed(() => {
    const view = this.calendarViewDate();
    const year = view.getFullYear();
    const month = view.getMonth();

    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: string; label: number; inMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = new Date(year, month - 1, d);
      days.push({ date: date.toISOString().split('T')[0], label: d, inMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({ date: date.toISOString().split('T')[0], label: d, inMonth: true });
    }

    return days;
  });

  calendarMonthLabel = computed(() =>
    this.calendarViewDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  // ---------- Date navigation ----------
  prevWeek(event: Event): void {
    event.stopPropagation();
    this.statisticsService.shiftWeek(-7);
  }

  nextWeek(event: Event): void {
    event.stopPropagation();
    this.statisticsService.shiftWeek(7);
  }

  // ---------- Date picker ----------
  toggleDatePicker(): void {
    this.isDatePickerOpen.update((v) => !v);
    this.isProjectMenuOpen.set(false);
    this.isStatusMenuOpen.set(false);
    this.tempStartDate.set(this.statisticsService.startDate());
    this.tempEndDate.set(this.statisticsService.endDate());
  }

  closeDatePicker(): void {
    this.isDatePickerOpen.set(false);
  }

  selectTempDate(dateStr: string): void {
    const start = this.tempStartDate();
    const end = this.tempEndDate();

    if (!start || (start && end && start !== end)) {
      this.tempStartDate.set(dateStr);
      this.tempEndDate.set(dateStr);
      return;
    }

    if (dateStr < start) {
      this.tempStartDate.set(dateStr);
    } else {
      this.tempEndDate.set(dateStr);
    }
  }

  applyDateRange(): void {
    const success = this.statisticsService.setDateRange(this.tempStartDate(), this.tempEndDate());
    if (success) {
      this.isDatePickerOpen.set(false);
    }
  }

  isInSelectedRange(dateStr: string): boolean {
    if (!dateStr) return false;
    return dateStr >= this.tempStartDate() && dateStr <= this.tempEndDate();
  }

  prevCalendarMonth(): void {
    const d = new Date(this.calendarViewDate());
    d.setMonth(d.getMonth() - 1);
    this.calendarViewDate.set(d);
  }

  nextCalendarMonth(): void {
    const d = new Date(this.calendarViewDate());
    d.setMonth(d.getMonth() + 1);
    this.calendarViewDate.set(d);
  }

  // ---------- Project menu ----------
  toggleProjectMenu(): void {
    this.isProjectMenuOpen.update((v) => !v);
    this.isDatePickerOpen.set(false);
    this.isStatusMenuOpen.set(false);
  }

  selectProject(projectId: string | null): void {
    this.statisticsService.setProjectFilter(projectId);
    this.isProjectMenuOpen.set(false);
  }

  // ---------- Status menu ----------
  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update((v) => !v);
    this.isDatePickerOpen.set(false);
    this.isProjectMenuOpen.set(false);
  }

  selectStatus(status: string | null): void {
    this.statisticsService.setStatusFilter(status);
    this.isStatusMenuOpen.set(false);
  }

  // ---------- KPI computed values ----------
  totalTasks = computed(() => this.statisticsService.calendarStats()?.total_tasks ?? 0);
  doneTasks = computed(() => this.statisticsService.calendarStats()?.done_tasks ?? 0);
  overdueTasks = computed(() => this.statisticsService.calendarStats()?.overdue_tasks ?? 0);

  // ---------- Weekly calendar ----------
  weekDays = computed(() => this.statisticsService.calendarStats()?.daily ?? []);

  isToday(dateStr: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }

  formatDayName(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  }

  formatDayNumber(dateStr: string): string {
    return new Date(dateStr).getDate().toString();
  }

  formatDayMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long' });
  }

  getStatusEntries(statuses: Record<string, number>): { status: string; count: number }[] {
    return Object.entries(statuses).map(([status, count]) => ({ status, count }));
  }

  formatStatusLabel(status: string): string {
    return status.replaceAll('_', ' ');
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      TO_DO: 'bg-[#C3C6D61A] text-[#737685]',
      IN_PROGRESS: 'bg-[#0052CC33] text-[#003D9B] lg:border-s-4 border-s-[#003D9B]',
      BLOCKED: 'bg-[#FFDAD61A] text-[#BA1A1A]',
      ACTIVE: 'bg-[#0052CC1A] text-[#003D9B]',
      DONE: 'bg-[#0068441A] text-[#004E32]',
      IN_REVIEW: 'bg-[#E5E8F0] text-[#4F5F7B]',
      READY_FOR_QA: 'bg-[#D6F5F2] text-[#0B7A6E]',
      REOPENED: 'bg-[#FFE3D1] text-[#B85C1F]',
      READY_FOR_PRODUCTION: 'bg-[#DCE4FF] text-[#3949AB]',
    };
    return map[status] ?? 'bg-[#F1F3FF] text-[#041B3C]';
  }
}
