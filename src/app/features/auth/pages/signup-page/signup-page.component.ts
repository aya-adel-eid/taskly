import { Component, inject } from '@angular/core';
import { HeaderAuthComponent } from "../../components/header-auth/header-auth.component";
import { RusableInputComponent } from "../../components/rusable-input/rusable-input.component";
import { RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [HeaderAuthComponent, RusableInputComponent, RouterLink,ReactiveFormsModule],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
public readonly fb=inject(FormBuilder);
signUpForm=this.fb.group({
  email:[null,[Validators.email,Validators.required]],
  password:[null,[Validators.required,Validators.minLength(8),
    Validators.maxLength(64),Validators.pattern( /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])\S{8,64}$/)]],
    data:this.fb.group(
      {
        name:[null,[Validators.required]],
        job_title:[null]
      }
      
    )
})
signUP(){
  console.log(this.signUpForm.value);
  
}
}
