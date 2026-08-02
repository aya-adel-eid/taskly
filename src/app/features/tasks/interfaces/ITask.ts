export interface ITask {
  id: string;
  project_id: string;
  epic_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  due_date: string|null;
  task_id: string;
  epic?: Epic|null;
  created_by: CreatedBy;
  assignee: Assignee|null;
}

export interface Epic {
  id: string;
  title: string;
  epic_id: string;
}

export interface CreatedBy {
  id: string;
  name: string;
  email: string;
  department: any;
}

export interface Assignee {
  id: string;
  name: string;
  email: string;
  department: any;
}

export interface ITaskStatusConfig {
  value: string;
  title: string;
  dotClass: string;
  badgeClass: string;
}
