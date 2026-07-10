import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderAuthComponent } from '../../components/header-auth/header-auth.component';
import { RusableInputComponent } from '../../components/rusable-input/rusable-input.component';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServicesService } from '../../services/auth-services.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ISignUp } from '../../interfaces/ISignUp';
import { interval, take, timer } from 'rxjs';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [HeaderAuthComponent, RusableInputComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css',
})
export class SignupPageComponent implements OnInit {
  public readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthServicesService);
  private readonly router = inject(Router);
  isLoading = signal<boolean>(false);
  errorMessage!: string;
  successMessage!: string;
  // form group
  signUpForm = this.fb.group(
    {
      email: [null, [Validators.email, Validators.required]],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])\S{8,64}$/),
        ],
      ],
      data: this.fb.group({
        name: [
          null,
          [
            Validators.required,
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
            Validators.pattern(/^(?!.*\s{2,})[\p{L}]+(?: [\p{L}]+)*$/u),
          ],
        ],
        job_title: [null],
      }),
      confirmPassword: [null],
    },
    { validators: this.confirmPassword }
  );

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
    special: false,
  };

  ngOnInit() {
    this.password?.valueChanges.subscribe((value: string | null) => {
      value = value ?? '';

      this.rules.length = value.length >= 8;

      this.rules.upperLowerNumber = /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

      this.rules.special = /[!@#$%^&*]/.test(value);
    });
  }
  // send Data

  signUP() {
    const { confirmPassword, ...userData } = this.signUpForm.value;
    if (this.signUpForm.valid) {
      this.isLoading.set(true);
      this.authService.signUp(userData).subscribe({
        next: (resp: ISignUp) => {
          this.isLoading.set(false);
          localStorage.setItem(StORED_KEYS.userToken, resp.access_token);
          localStorage.setItem(StORED_KEYS.refresh_token, resp.refresh_token);
          this.successMessage =
            'Your account has been created successfully. You will be redirected to the Projects page.';
          timer(5000).subscribe(() => {
            this.router.navigateByUrl('/project');
          });
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          console.log(error);
          this.errorMessage = error.error.msg;
        },
      });
    }
  }
  // confirm password
  confirmPassword(control: AbstractControl) {
    if (control.get('password')?.value === control.get('confirmPassword')?.value) {
      return null;
    } else {
      return { mismatch: true };
    }
  }
}
