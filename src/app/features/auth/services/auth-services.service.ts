import { Injectable } from '@angular/core';
import { BaseHttpClientService } from '../../../core/services/Utilites/base-http-client.service';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { ISignIn } from '../interfaces/IUserData';

@Injectable({
  providedIn: 'root'
})
export class AuthServicesService  extends BaseHttpClientService{
// sign up
signUp(userData:{}){
  return this.httpClient.post(APIS_KEYS.AUTH.signUp,userData)
}
// login
signIn(userData:{}){
return this.httpClient.post<ISignIn>(APIS_KEYS.AUTH.login,userData)
}

}
