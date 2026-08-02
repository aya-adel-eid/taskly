import { Component, inject, input } from '@angular/core';
import { IEpicsProject } from '../../interfaces/IEpicsProject';
import { DatePipe } from '@angular/common';
import { ProjectsService } from '../../../projects/services/projects.service';
import { SharedServiceService } from '../../../../shared/shared-service.service';

@Component({
  selector: 'app-card-epic',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './card-epic.component.html',
  styleUrl: './card-epic.component.css',
})
export class CardEpicComponent {
  sharedService = inject(SharedServiceService);
  epic = input<IEpicsProject>();
}
