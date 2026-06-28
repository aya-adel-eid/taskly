import { environment } from "../../../environments/environment";

export const APIS_KEYS={
    AUTH:{
        signUp:`${environment.baseUrRL}/auth/v1/signup`,
        login:`${environment.baseUrRL}/auth/v1/token?grant_type=password`
    }
}