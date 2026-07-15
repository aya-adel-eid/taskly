import { Component, output } from '@angular/core';

@Component({
  selector: 'app-handle-error',
  standalone: true,
  imports: [],
  templateUrl: './handle-error.component.html',
  styleUrl: './handle-error.component.css',
})
export class HandleErrorComponent {
  retry = output<void>();

  onRetry() {
    this.retry.emit();
  }
}
