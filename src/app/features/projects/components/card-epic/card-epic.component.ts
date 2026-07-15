import { Component, inject, input } from '@angular/core';
import { IEpicsProject } from '../../interfaces/IEpicsProject';
import { DatePipe } from '@angular/common';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-card-epic',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './card-epic.component.html',
  styleUrl: './card-epic.component.css',
})
export class CardEpicComponent {
  projectServices = inject(ProjectsService);
  epic = input<IEpicsProject>();
}
