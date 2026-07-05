import { Component, inject, input } from '@angular/core';
import { IProject } from '../../interfaces/Iprojects';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-card-project',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './card-project.component.html',
  styleUrl: './card-project.component.css'
})
export class CardProjectComponent {
project=input<IProject>()
selected = input(false);
private readonly projectService=inject(ProjectsService)
selectProject(project: IProject) {
   this.projectService.selectedProjectId.set(project.id);
   this.projectService.projectEdit.set(project)
}
}
