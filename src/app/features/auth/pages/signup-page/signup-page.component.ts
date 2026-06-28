import { Component, inject } from '@angular/core';
import { HeaderAuthComponent } from "../../components/header-auth/header-auth.component";
import { RusableInputComponent } from "../../components/rusable-input/rusable-input.component";
import { RouterLink } from "@angular/router";
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServicesService } from '../../services/auth-services.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [HeaderAuthComponent, RusableInputComponent, RouterLink,ReactiveFormsModule],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
public readonly fb=inject(FormBuilder);
private readonly authService=inject(AuthServicesService)
// form group
signUpForm=this.fb.group({
  email:[null,[Validators.email,Validators.required]],
  password:[null,[Validators.required,Validators.minLength(8),
    Validators.maxLength(64),Validators.pattern( /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])\S{8,64}$/)]],
    data:this.fb.group(
      {
        name:[null,[Validators.required]],
        job_title:[null]
      },
      
    ),
    confirmPassword:[null]
},{Validators:this.confirmPassword})
// send Data

signUP(){
const {confirmPassword,...userData}=this.signUpForm.value
  this.authService.signUp(userData).subscribe(({
    next:(resp)=>{
console.log(resp);

    },
    error:(error:HttpErrorResponse)=>{
      console.log(error);
      
    }
  }))
  console.log(this.signUpForm.value);
  
}
// confirm password
confirmPassword(control:AbstractControl){
 if (control.get('password')?.value===control.get('confirmPassword')?.value) {
  return null
 }
 else{
  return { mismatch: true };
 }
}
}
