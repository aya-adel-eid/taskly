import { Component, inject } from '@angular/core';
import { HeaderAuthComponent } from "../../components/header-auth/header-auth.component";
import { RusableInputComponent } from "../../components/rusable-input/rusable-input.component";
import { Router, RouterLink } from "@angular/router";
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
private readonly router=inject(Router)
errorMessage!:string;
// form group
signUpForm=this.fb.group({
  email:[null,[Validators.email,Validators.required]],
  password:[null,[Validators.required,Validators.minLength(8),
    Validators.maxLength(64),Validators.pattern( /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])\S{8,64}$/)]],
    data:this.fb.group(
      {
        name:[null,[Validators.required,  
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
    Validators.pattern(/^(?!.*\s{2,})[\p{L}]+(?: [\p{L}]+)*$/u)
  ]],
        job_title:[null]
      },
      
    ),
    confirmPassword:[null]
},{Validators:this.confirmPassword})

// rule
get password() {
  return this.signUpForm.get('password');
}

get passwordValue(): string {
  return this.password?.value || '';
}

rules = {
  length: false,
  upperLowerNumber: false,
  special: false
};

ngOnInit() {
  this.password?.valueChanges.subscribe((value: string) => {
    value = value || '';

    this.rules.length = value.length >= 8;

    this.rules.upperLowerNumber =
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value);

    this.rules.special =
      /[!@#$%^&*]/.test(value);
  });
}
// send Data

signUP(){
const {confirmPassword,...userData}=this.signUpForm.value
if (this.signUpForm.valid) {
  this.authService.signUp(userData).subscribe(({
    next:(resp:any)=>{
this.router.navigateByUrl('/project')

    },
    error:(error:HttpErrorResponse)=>{
      console.log(error);
      this.errorMessage=error.error.msg
      
    }
  }))
  
}

  
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
