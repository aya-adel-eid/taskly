import { Component, computed, inject, input } from '@angular/core';
import { IProject } from '../../interfaces/Iprojects';
import { DatePipe, JsonPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';

@Component({
  selector: 'app-card-project',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './card-project.component.html',
  styleUrl: './card-project.component.css',
})
export class CardProjectComponent {
  project = input<IProject>();
  selected = input(false);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectsService);
  isSelected = computed(() => this.projectService.selectedProjectId() === this.project()?.id);

  selectProject(project: IProject) {
    const isCurrentlySelected = this.projectService.selectedProjectId() === project.id;

    if (isCurrentlySelected) {
      sessionStorage.removeItem(StORED_KEYS.projectId);
      this.projectService.selectedProjectId.set('');
      sessionStorage.removeItem(StORED_KEYS.projectName);
      sessionStorage.removeItem(StORED_KEYS.project);
    } else {
      sessionStorage.setItem(StORED_KEYS.projectId, project.id);
      this.projectService.selectedProjectId.set(project.id);
      sessionStorage.setItem(StORED_KEYS.projectName, project.name);
      sessionStorage.setItem(StORED_KEYS.project, JSON.stringify(project));
      this.router.navigateByUrl(`/project/${project.id}/epics`);
    }
    this.projectService.projectEdit.set(project);
  }
  editProject(project: IProject) {
    this.projectService.projectEdit.set(project);
    sessionStorage.setItem(StORED_KEYS.project, JSON.stringify(project));
  }
}
