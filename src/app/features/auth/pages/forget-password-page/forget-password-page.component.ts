import { Component, computed, inject, signal } from '@angular/core';
import { HeaderAuthComponent } from '../../components/header-auth/header-auth.component';
import { RusableInputComponent } from '../../components/rusable-input/rusable-input.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServicesService } from '../../services/auth-services.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { interval, take } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forget-password-page',
  standalone: true,
  imports: [RusableInputComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './forget-password-page.component.html',
  styleUrl: './forget-password-page.component.css',
})
export class ForgetPasswordPageComponent {
  isSuccess = signal<boolean>(false);
  errorMessage = signal<string>('');
  loading = signal<boolean>(false);
  private readonly authServices = inject(AuthServicesService);
  count = signal<number>(300);
  minutes = computed(() => Math.floor(this.count() / 60));
  seconds = computed(() => this.count() % 60);
  isDisabled = signal<boolean>(false);
  forgetPasswordForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
  });
  forgetPassword() {
    this.errorMessage.set('');
    this.isSuccess.set(false);
    this.isDisabled.set(true);
    if (this.forgetPasswordForm.valid) {
      this.loading.set(true);
      this.authServices.forgetPassword(this.forgetPasswordForm.value).subscribe({
        next: (resp) => {
          this.loading.set(false);
          console.log(resp);
          this.isSuccess.set(true);
          interval(1000)
            .pipe(take(300))
            .subscribe(() => {
              this.count.set(this.count() - 1);
              if (this.count() === 0) {
                this.isDisabled.set(false);
              }
            });
          console.log(resp);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.isSuccess.set(false);
          console.log(error);
          this.isDisabled.set(false);
          this.errorMessage.set(error.error.msg);
        },
      });
    }
  }
}
