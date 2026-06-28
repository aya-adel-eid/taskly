import { inject, Injectable } from '@angular/core';

import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { ISignIn } from '../interfaces/IUserData';
import { UserInfo } from '../interfaces/UserInfo';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StORED_KEYS } from '../../../core/constants/STORED_KEYS';
import { ISignUp } from '../interfaces/ISignUp';

@Injectable({
  providedIn: 'root'
})
export class AuthServicesService {
  private readonly httpClient=inject(HttpClient)
  private readonly router=inject(Router)
    private readonly REMEMBER_ME_DAYS = 30;
// sign up
signUp(userData:{}){
  return this.httpClient.post<ISignUp>(APIS_KEYS.AUTH.signUp,userData)
}
// login
signIn(userData:{}){
return this.httpClient.post<ISignIn>(APIS_KEYS.AUTH.login,userData)
}
// get user data
getUserInfo(){
  return this.httpClient.get<UserInfo>(APIS_KEYS.AUTH.userData)
}
// logOut
logOut(){
  return this.httpClient.post(APIS_KEYS.AUTH.logOut,{}).subscribe({
    next:()=>{
       this.router.navigateByUrl('/login')
       this.clearSession()
      //  localStorage.removeItem(StORED_KEYS.userToken)
      //  localStorage.removeItem(StORED_KEYS.refresh_token)
    },
    error:(error:HttpErrorResponse)=>{
      console.log(error);
      this.clearSession()
      
    }
  })
}
// Remember

  storeSession(tokens: { access_token: string; refresh_token: string }, rememberMe: boolean): void {
    const storage: Storage = rememberMe ? localStorage : sessionStorage;
 
    storage.setItem(StORED_KEYS.userToken, tokens.access_token);
    storage.setItem(StORED_KEYS.refresh_token, tokens.refresh_token);
 
    if (rememberMe) {
      const expiresAt = Date.now() + this.REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(StORED_KEYS.rememberMeExpiry, String(expiresAt));
    }
  }

   isRememberMeExpired(): boolean {
    const expiresAt = localStorage.getItem(StORED_KEYS.rememberMeExpiry);
    if (!expiresAt) {
      return false; // "remember me" was never set — nothing to expire
    }
    return Date.now() > Number(expiresAt);
  }
 
  getToken(): string | null {
    return localStorage.getItem(StORED_KEYS.userToken) ?? sessionStorage.getItem(StORED_KEYS.userToken);
  }
  private clearSession(): void {
    localStorage.removeItem(StORED_KEYS.userToken);
    localStorage.removeItem(StORED_KEYS.refresh_token);
    localStorage.removeItem(StORED_KEYS.rememberMeExpiry);
    sessionStorage.removeItem(StORED_KEYS.userToken);
    sessionStorage.removeItem(StORED_KEYS.refresh_token);
  }

}
