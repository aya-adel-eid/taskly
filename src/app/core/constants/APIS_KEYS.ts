import { environment } from "../../../environments/environment";

export const APIS_KEYS={
    AUTH:{
        signUp:`${environment.baseUrRL}/auth/v1/signup`,
        login:`${environment.baseUrRL}/auth/v1/token?grant_type=password`,
        userData:`${environment.baseUrRL}/auth/v1/user`,
        logOut:`${environment.baseUrRL}/auth/v1/logout`,
        forgetpassword:`${environment.baseUrRL}/auth/v1/recover`,
        resetPassword:`${environment.baseUrRL}/auth/v1/user`,
        refreshToken:`${environment.baseUrRL}/auth/v1/token?grant_type=refresh_token`,
        allProjects:`${environment.baseUrRL}/rest/v1/rpc/get_projects`,
        
    },
    projects:{
        createnewProject:`${environment.baseUrRL}/rest/v1/projects`,
        listProjects:`${environment.baseUrRL}/rest/v1/rpc/get_projects`,
        editProject:`${environment.baseUrRL}/rest/v1/projects`,
        allMembers:`${environment.baseUrRL}/rest/v1/get_project_members`
}
}