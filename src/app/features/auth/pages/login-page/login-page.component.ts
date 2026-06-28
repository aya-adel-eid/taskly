import { Component, inject } from '@angular/core';
import { RusableInputComponent } from "../../components/rusable-input/rusable-input.component";
import { HeaderAuthComponent } from "../../components/header-auth/header-auth.component";
import { RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServicesService } from '../../services/auth-services.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RusableInputComponent, HeaderAuthComponent, RouterLink,ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly authService=inject(AuthServicesService)
private readonly fb=inject(FormBuilder)
loginForm=this.fb.group({
  email:[null,[Validators.required,Validators.email]],
  password:[null,[Validators.required]]
})
// log in
login(){
  console.log(this.loginForm.value);
  
this.authService.signIn(this.loginForm.value).subscribe({
  next:(resp)=>{
    console.log(resp);
    
  },
  error:(error:HttpErrorResponse)=>{
    console.log(error);
    
  }
})
}
}
