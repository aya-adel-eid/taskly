import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-card-add-project-static',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './card-add-project-static.component.html',
  styleUrl: './card-add-project-static.component.css',
})
export class CardAddProjectStaticComponent {
  private readonly projectsService = inject(ProjectsService);
  addNewProject() {
    this.projectsService.projectEdit.set(null);
  }
}
