import { Component } from '@angular/core';
import { RusableInputComponent } from "../../components/rusable-input/rusable-input.component";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RusableInputComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

}
