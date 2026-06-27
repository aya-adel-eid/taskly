import { Component } from '@angular/core';
import { RusableInputComponent } from "../../components/rusable-input/rusable-input.component";
import { HeaderAuthComponent } from "../../components/header-auth/header-auth.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RusableInputComponent, HeaderAuthComponent, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

}
