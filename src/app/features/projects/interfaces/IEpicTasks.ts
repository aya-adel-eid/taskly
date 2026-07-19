export interface IEpicTasks {
  id: string;
  project_id: string;
  epic_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  due_date: string;
  task_id: string;
  epic: Epic;
  created_by: CreatedBy;
  assignee: Assignee;
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
}
