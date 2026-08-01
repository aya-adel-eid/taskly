import { environment } from '../../../environments/environment';
const AUTH_BASE = '/auth/v1';
const REST_BASE = '/rest/v1';
export const APIS_KEYS = {
  AUTH: {
    signUp: `${environment.baseUrRL}${AUTH_BASE}/signup`,
    login: `${environment.baseUrRL}${AUTH_BASE}/token?grant_type=password`,
    userData: `${environment.baseUrRL}${AUTH_BASE}/user`,
    logOut: `${environment.baseUrRL}${AUTH_BASE}/logout`,
    forgetpassword: `${environment.baseUrRL}${AUTH_BASE}/recover`,
    resetPassword: `${environment.baseUrRL}${AUTH_BASE}/user`,
    refreshToken: `${environment.baseUrRL}${AUTH_BASE}/token?grant_type=refresh_token`,
    allProjects: `${environment.baseUrRL}${AUTH_BASE}/rpc/get_projects`,
  },
  projects: {
    createnewProject: `${environment.baseUrRL}${REST_BASE}/projects`,
    listProjects: `${environment.baseUrRL}${REST_BASE}/rpc/get_projects`,
    editProject: `${environment.baseUrRL}${REST_BASE}/projects`,
    allMembers: `${environment.baseUrRL}${REST_BASE}/get_project_members`,
    NewEpics: `${environment.baseUrRL}${REST_BASE}/epics`,
    getEpics: `${environment.baseUrRL}${REST_BASE}/project_epics`,
    NewTask: `${environment.baseUrRL}${REST_BASE}/tasks`,
    updateEpic: `${environment.baseUrRL}${REST_BASE}/epics`,
    getEpicTasks: `${environment.baseUrRL}${REST_BASE}/project_tasks`,
    updateTasks: `${environment.baseUrRL}${REST_BASE}/tasks`,
    inviteMember: `${environment.baseUrRL}${REST_BASE}/rpc/invite_member`,
    acceptInvitation: `${environment.baseUrRL}${REST_BASE}/rpc/accept_invitation`,
  },
};
