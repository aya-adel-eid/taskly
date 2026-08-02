import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { IProjectTaskCount, IStatisticsResponse, IStatusOption } from '../interfaces/IStatistics';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private httpClient = inject(HttpClient);

  // ---------- Calendar + KPI data ----------
  calendarStats = signal<IStatisticsResponse | null>(null);
  isLoadingCalendarStats = signal(false);
  calendarStatsError = signal(false);

  // ---------- Tasks per project data ----------
  tasksPerProject = signal<IProjectTaskCount[] | null>(null);
  isLoadingTasksPerProject = signal(false);
  tasksPerProjectError = signal(false);

  // ==================================================
  // ---------- Filtering state ----------
  // ==================================================

  startDate = signal<string>(this.getStartOfWeek());
  endDate = signal<string>(this.getEndOfWeek());
  selectedProjectId = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);
  dateRangeError = signal<string>('');

  readonly statusOptions: IStatusOption[] = [
    { value: 'TO_DO', label: 'TO DO' },
    { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
    { value: 'BLOCKED', label: 'BLOCKED' },
    { value: 'IN_REVIEW', label: 'IN REVIEW' },
    { value: 'READY_FOR_QA', label: 'READY FOR QA' },
    { value: 'REOPENED', label: 'REOPENED' },
    { value: 'READY_FOR_PRODUCTION', label: 'READY FOR PRODUCTION' },
    { value: 'DONE', label: 'DONE' },
  ];

  dateRangeLabel = computed(() => {
    const start = new Date(this.startDate());
    const end = new Date(this.endDate());
    const sameMonth = start.getMonth() === end.getMonth();

    const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = sameMonth
      ? end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })
      : end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startLabel} - ${endLabel}`;
  });

  /** بيتنادى لما يتغير أي فلتر — بيجيب الاتنين APIs مرة واحدة */
  applyFiltersAndReload(): void {
    this.getTasksCalendarStats();
    this.getTasksCountPerProject();
  }

  setProjectFilter(projectId: string | null): void {
    this.selectedProjectId.set(projectId);
    this.applyFiltersAndReload();
  }

  setStatusFilter(status: string | null): void {
    this.selectedStatus.set(status);
    this.applyFiltersAndReload();
  }

  shiftWeek(days: number): void {
    const start = new Date(this.startDate());
    const end = new Date(this.endDate());
    start.setDate(start.getDate() + days);
    end.setDate(end.getDate() + days);

    this.startDate.set(start.toISOString().split('T')[0]);
    this.endDate.set(end.toISOString().split('T')[0]);
    this.applyFiltersAndReload();
  }

  setDateRange(start: string, end: string): boolean {
    const diffDays = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 6) {
      this.dateRangeError.set('You can select a maximum range of 7 days.');
      return false;
    }

    if (diffDays < 0) {
      this.dateRangeError.set('End date must be after start date.');
      return false;
    }

    this.dateRangeError.set('');
    this.startDate.set(start);
    this.endDate.set(end);
    this.applyFiltersAndReload();
    return true;
  }

  resetFilters(): void {
    this.startDate.set(this.getStartOfWeek());
    this.endDate.set(this.getEndOfWeek());
    this.selectedProjectId.set(null);
    this.selectedStatus.set(null);
    this.dateRangeError.set('');
    this.applyFiltersAndReload();
  }

  private getStartOfWeek(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  private getEndOfWeek(): string {
    const start = new Date(this.getStartOfWeek());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end.toISOString().split('T')[0];
  }

  // ==================================================
  // ---------- API calls ----------
  // ==================================================

  /**
   * API #1 — Calendar + KPI stats
   * POST /rest/v1/rpc/get_tasks_calendar_stats
   */
  getTasksCalendarStats() {
    this.isLoadingCalendarStats.set(true);
    this.calendarStatsError.set(false);

    const body = {
      p_start_date: this.startDate(),
      p_end_date: this.endDate(),
      p_project_id: this.selectedProjectId(),
      p_status: this.selectedStatus(),
    };

    return this.httpClient
      .post<IStatisticsResponse>(APIS_KEYS.projects.tasksClander, body)
      .subscribe({
        next: (resp) => {
          this.calendarStats.set(resp);
          this.isLoadingCalendarStats.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.calendarStatsError.set(true);
          this.isLoadingCalendarStats.set(false);
        },
      });
  }

  getTasksCountPerProject() {
    this.isLoadingTasksPerProject.set(true);
    this.tasksPerProjectError.set(false);

    const body = {
      p_start_date: this.startDate(),
      p_end_date: this.endDate(),
    };

    return this.httpClient
      .post<IProjectTaskCount[]>(APIS_KEYS.projects.tasksCount, body)
      .subscribe({
        next: (resp) => {
          this.tasksPerProject.set(resp);
          this.isLoadingTasksPerProject.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.tasksPerProjectError.set(true);
          this.isLoadingTasksPerProject.set(false);
        },
      });
  }
}
