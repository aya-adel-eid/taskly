export interface Metadata {
  sub: string;
  name: string;
  email: string;
  department: string;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface Member {
  member_id: string;
  project_id: string;
  user_id: string;
  role: string;
  email: string;
  metadata: Metadata;
}
