export interface UserInfo {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: Appmetadata;
  user_metadata: Usermetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: Usermetadata;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface Usermetadata {
  email: string;
  email_verified: boolean;
  job_title: string;
  name: string;
  phone_verified: boolean;
  sub: string;
}

interface Appmetadata {
  provider: string;
  providers: string[];
}