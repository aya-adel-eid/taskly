import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-epics',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empty-epics.component.html',
  styleUrl: './empty-epics.component.css',
})
export class EmptyEpicsComponent implements OnInit {
  private readonly activateRoute = inject(ActivatedRoute);
  projectId = signal<string>('');
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => this.projectId.set(param.get('projectId')!));
  }
  cardData = [
    {
      img: `/assets/images/Background (1).png`,
      title: `High-Level Goals`,
      content: `Define the broad objectives
that span across multiple
cycles.`,
    },
    {
      img: `/assets/images/Background.png`,
      title: `Hierarchy Design`,
      content: `Link individual tasks to
parent epics for a
consolidated view.`,
    },
    {
      img: `/assets/images/Background (2).png`,
      title: `Track Velocity`,
      content: `Visualize percentage
completion at a macro
project level.`,
    },
  ];
}
