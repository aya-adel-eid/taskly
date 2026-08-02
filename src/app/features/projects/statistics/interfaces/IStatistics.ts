export interface IDailyStat {
  day: string;
  statuses: Record<string, number>;
}

export interface IStatisticsResponse {
  daily: IDailyStat[];
  totals: Record<string, number>;
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
}

export interface IProjectTaskCount {
  project_id: string;
  project_name: string;
  tasks_count: number;
}

export interface IStatusOption {
  value: string;
  label: string;
}
