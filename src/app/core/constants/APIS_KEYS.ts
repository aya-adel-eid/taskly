import { environment } from "../../../environments/environment";

export const APIS_KEYS={
    AUTH:{
        signUp:`${environment.baseUrRL}/auth/v1/signup`,
        login:`${environment.baseUrRL}/auth/v1/token?grant_type=password`,
        userData:`${environment.baseUrRL}/auth/v1/user`,
        logOut:`${environment.baseUrRL}/auth/v1/logout`
    }
}