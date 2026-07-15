export interface IEpicsProject {
  id: string;
  epic_id: string;
  title: string;
  description: string;
  deadline: string;
  created_at: string;
  created_by: CreatedBy;
  assignee: Assignee;
}

export interface CreatedBy {
  sub: string;
  name: string;
  email: string;
  department: string;
}

export interface Assignee {
  sub: string;
  name: string;
  email: string;
  department: string;
}
