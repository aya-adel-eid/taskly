import { inject, Injectable } from '@angular/core';
import { StORED_KEYS } from '../core/constants/STORED_KEYS';
import { ProjectsService } from '../features/projects/services/projects.service';

@Injectable({
  providedIn: 'root',
})
export class SharedServiceService {
  private readonly projectServices = inject(ProjectsService);
  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
  unSelecteProject() {
    sessionStorage.removeItem(StORED_KEYS.projectId);
    this.projectServices.selectedProjectId.set('');
    sessionStorage.removeItem(StORED_KEYS.project);
  }
}
