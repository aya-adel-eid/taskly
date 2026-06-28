import { Component, inject } from '@angular/core';
import { RusableInputComponent } from "../../components/rusable-input/rusable-input.component";
import { HeaderAuthComponent } from "../../components/header-auth/header-auth.component";
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServicesService } from '../../services/auth-services.service';
import { HttpErrorResponse } from '@angular/common/http';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RusableInputComponent, HeaderAuthComponent, RouterLink,ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly authService=inject(AuthServicesService)
  private readonly router=inject(Router)
  // build form
private readonly fb=inject(FormBuilder)
loginForm=this.fb.group({
  email:[null,[Validators.required,Validators.email]],
  password:[null,[Validators.required]],
   rememberMe: [false],
})



// log in
login(){
  const {rememberMe,...userData}=this.loginForm.value
if (this.loginForm.valid) {
  this.authService.signIn(userData).subscribe({
    next:(resp)=>{
      this.authService.storeSession(resp,rememberMe!)
      this.router.navigateByUrl('/project')
    // localStorage.setItem(StORED_KEYS.userToken,resp.access_token)
    // localStorage.setItem(StORED_KEYS.refresh_token,resp.refresh_token)
      
    },
    error:(error:HttpErrorResponse)=>{
      console.log(error);
      
    }
  })
  
}
  
}
}
