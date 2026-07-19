import { Component, inject, input } from '@angular/core';
import { IEpicTasks } from '../../interfaces/IEpicTasks';
import { ProjectsService } from '../../services/projects.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  private readonly projectSerivce = inject(ProjectsService);
  task = input<IEpicTasks>();
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('');
  }

  private isDone(): boolean {
    return this.task()?.status === 'DONE';
  }

  isOverdue(): boolean {
    if (this.isDone()) return false;
    const due = new Date(this.task()?.due_date!);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }

  // statusConfig(): StatusConfig {
  //   return STATUSES.find((s) => s.value === this.task()?.status) ?? DEFAULT_STATUS;
  // }
}
