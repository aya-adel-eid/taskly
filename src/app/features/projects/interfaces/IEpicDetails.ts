export interface IEpicDetails {
  id: string;
  project_id: string;
  title: string;
  description: string;
  created_at: string;
  deadline: string;
  epic_id: string;
  created_by: CreatedBy;
  assignee: Assignee;
}

export interface CreatedBy {
  sub: string;
  name: string;
  email?: string;
  department?: any;
}

export interface Assignee {
  sub: string;
  name: string;
  email?: string;
  department?: any;
}
