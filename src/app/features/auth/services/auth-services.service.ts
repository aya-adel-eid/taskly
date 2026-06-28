import { inject, Injectable } from '@angular/core';
import { BaseHttpClientService } from '../../../core/services/Utilites/base-http-client.service';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { ISignIn } from '../interfaces/IUserData';
import { UserInfo } from '../interfaces/UserInfo';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StORED_KEYS } from '../../../core/constants/STORED_KEYS';

@Injectable({
  providedIn: 'root'
})
export class AuthServicesService  extends BaseHttpClientService{
  private readonly router=inject(Router)
// sign up
signUp(userData:{}){
  return this.httpClient.post(APIS_KEYS.AUTH.signUp,userData)
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
  return this.httpClient.post(APIS_KEYS.AUTH.logOut,'').subscribe({
    next:(resp)=>{
       this.router.navigateByUrl('/login')
       localStorage.removeItem(StORED_KEYS.userToken)
       localStorage.removeItem(StORED_KEYS.refresh_token)
    },
    error:(error:HttpErrorResponse)=>{
      console.log(error);
      
    }
  })
}

}
