import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-project-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empty-project-card.component.html',
  styleUrl: './empty-project-card.component.css',
})
export class EmptyProjectCardComponent {}
