import { Component, inject, signal, OnInit } from '@angular/core';
import { RusableInputComponent } from '../../components/rusable-input/rusable-input.component';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServicesService } from '../../services/auth-services.service';
import { interval, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [RusableInputComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.css',
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authServices = inject(AuthServicesService);
  private readonly router = inject(Router);
  loading = signal<boolean>(false);
  errorMsg = signal<string>('');
  accessToken!: string;
  successMessage = signal<string>('');
  ngOnInit() {
    const hash = window.location.hash.substring(1);

    const params = new URLSearchParams(hash);

    this.accessToken = params.get('access_token') ?? '';
    const refreshToken = params.get('refresh_token');
    console.log(this.accessToken);
  }

  resetPasswordForm = this.fb.group(
    {
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])\S{8,64}$/),
        ],
      ],

      confirmPassword: [null],
    },
    { validators: this.confirmPassword }
  );
  // rule
  get password() {
    return this.resetPasswordForm.get('password');
  }

  get passwordValue(): string {
    return this.password?.value ?? '';
  }

  get rules() {
    const password = this.passwordValue;

    return {
      length: password.length >= 8 && password.length <= 64,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }
  // confirm password
  confirmPassword(control: AbstractControl) {
    if (control.get('password')?.value === control.get('confirmPassword')?.value) {
      return null;
    } else {
      return { mismatch: true };
    }
  }
  // call Api
  resetPassword() {
    this.successMessage.set('');
    this.errorMsg.set('');
    const { confirmPassword, ...password } = this.resetPasswordForm.value;
    if (this.resetPasswordForm.valid) {
      this.loading.set(true);
      this.authServices.updatePassword(password, this.accessToken).subscribe({
        next: () => {
          this.loading.set(false);
          this.errorMsg.set('');
          this.successMessage.set(
            'Your password has been updated successfully. You can now log in'
          );
          interval(1000)
            .pipe(take(3))
            .subscribe(() => {
              history.replaceState(null, '', '/login');
              this.router.navigateByUrl('/login');
            });
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.successMessage.set('');
          console.log(error);
          this.errorMsg.set(error.error.msg);
        },
      });
    }
  }
}
