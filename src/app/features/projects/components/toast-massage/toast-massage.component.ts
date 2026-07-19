import { Component, input } from '@angular/core';

@Component({
  selector: 'app-toast-massage',
  standalone: true,
  imports: [],
  templateUrl: './toast-massage.component.html',
  styleUrl: './toast-massage.component.css',
})
export class ToastMassageComponent {
  message = input('');
  flag = input();
}
