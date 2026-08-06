import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { IProject } from '../interfaces/Iprojects';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly httpClient = inject(HttpClient);
  projectEdit = signal<IProject | null>(null);
  allProjects = signal<IProject[] | null>(null);
  hasError = signal<boolean>(false);
  totalCount = signal<number>(0);
  isLoading = signal<boolean>(true);
  selectedProjectId = signal<string>('');
  isSelected = signal<boolean>(false);

  createNewProject(data: {}) {
    return this.httpClient.post(APIS_KEYS.projects.createnewProject, data);
  }
  getProjects() {
    return this.httpClient.get<IProject[]>(APIS_KEYS.projects.listProjects);
  }

  getAllProjects(limit = 5, page = 1, append = false) {
    const offset = (page - 1) * limit;

    this.isLoading.set(true);

    return this.httpClient
      .get<IProject[]>(`${APIS_KEYS.projects.listProjects}?limit=${limit}&offset=${offset}`, {
        headers: {
          Prefer: 'count=exact',
        },
        observe: 'response',
      })
      .subscribe({
        next: (resp) => {
          this.hasError.set(false);

          if (append) {
            this.allProjects.update((current) => [...(current ?? []), ...(resp.body ?? [])]);
          } else {
            this.allProjects.set(resp.body ?? []);
          }

          this.isLoading.set(false);

          const contentRange = resp.headers.get('Content-Range');
          if (contentRange) {
            this.totalCount.set(+contentRange.split('/')[1]);
          }
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  updateProject(id: string, projectEdit: {}) {
    return this.httpClient.patch(`${APIS_KEYS.projects.editProject}?id=eq.${id}`, projectEdit);
  }
  getInitials(name?: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
