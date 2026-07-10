import { Component, inject, signal } from '@angular/core';
import { RusableInputComponent } from '../../components/rusable-input/rusable-input.component';
import { HeaderAuthComponent } from '../../components/header-auth/header-auth.component';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServicesService } from '../../services/auth-services.service';
import { HttpErrorResponse } from '@angular/common/http';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';
import { ISignIn } from '../../interfaces/IUserData';
import { interval, take, timer } from 'rxjs';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RusableInputComponent, HeaderAuthComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthServicesService);
  private readonly router = inject(Router);
  errorMessage!: string;
  successMessage!: string;
  loading = signal<boolean>(false);
  // build form
  private readonly fb = inject(FormBuilder);
  loginForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [
      null,
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])\S{8,64}$/),
      ],
    ],
    rememberMe: [false],
  });

  // log in
  login() {
    const { rememberMe, ...userData } = this.loginForm.value;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.authService.signIn(userData).subscribe({
        next: (resp: ISignIn) => {
          this.loading.set(false);
          this.successMessage =
            'Your sign In successfully. You will be redirected to the Projects page.';
          timer(5000).subscribe(() => {
            this.router.navigateByUrl('/project');
          });
          this.authService.storeSession(resp, rememberMe!);

          localStorage.setItem(StORED_KEYS.userToken, resp.access_token);
          localStorage.setItem(StORED_KEYS.refresh_token, resp.refresh_token);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage = 'Something went wrong. Please try again';
          console.log(error.error.msg);
        },
      });
    }
  }
}
