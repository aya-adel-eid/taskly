import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { AuthServicesService } from './features/auth/services/auth-services.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Taskly';
  private readonly authService = inject(AuthServicesService);
  ngOnInit(): void {
    if (this.authService.isRememberMeExpired()) {
      this.authService.logOut();
    }
  }
}
