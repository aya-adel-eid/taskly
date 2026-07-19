import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { IProject } from '../interfaces/Iprojects';
import { Member } from '../interfaces/IMembers';
import { IEpicsProject } from '../interfaces/IEpicsProject';
import { IEpicDetails } from '../interfaces/IEpicDetails';
import { IEpicTasks } from '../interfaces/IEpicTasks';

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
  epicsIsLoadding = signal<boolean>(false);
  epicsError = signal<boolean>(false);
  allEpics = signal<IEpicsProject[] | []>([]);
  totalCountEpics = signal<number>(0);
  epics = signal<IEpicsProject[] | null>(null);
  epic = signal<IEpicDetails | null>(null);
  showPoupDetail = signal<boolean>(false);
  epicTasks = signal<IEpicTasks[] | null>(null);
  createNewProject(data: {}) {
    return this.httpClient.post(APIS_KEYS.projects.createnewProject, data);
  }
  // getAllProjects(){
  //   return this.httpClient.get<IProject[]>(APIS_KEYS.projects.listProjects)
  // }ط
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
  // edit project
  updateProject(id: string, projectEdit: {}) {
    return this.httpClient.patch(`${APIS_KEYS.projects.editProject}?id=eq.${id}`, projectEdit);
  }
  getAllMembers(idProject: string) {
    return this.httpClient.get<Member[]>(
      `${APIS_KEYS.projects.allMembers}?project_id=eq.${idProject}`
    );
  }
  //
  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
  //Add new Epics
  addNewEpics(epicData: {}) {
    return this.httpClient.post(APIS_KEYS.projects.NewEpics, epicData);
  }
  // get allEpics
  getAllEpics(limit = 5, page = 1, append = false, projectId: string) {
    const offset = (page - 1) * limit;

    this.epicsIsLoadding.set(true);

    return this.httpClient
      .get<IEpicsProject[]>(
        `${APIS_KEYS.projects.getEpics}?project_id=eq.${projectId}&limit=${limit}&offset=${offset}`,
        {
          headers: {
            Prefer: 'count=exact',
          },
          observe: 'response',
        }
      )
      .subscribe({
        next: (resp) => {
          this.epicsError.set(false);

          if (append) {
            this.allEpics.update((current) => [...(current ?? []), ...(resp.body ?? [])]);
          } else {
            this.allEpics.set(resp.body ?? []);
          }

          this.epicsIsLoadding.set(false);

          const contentRange = resp.headers.get('Content-Range');
          if (contentRange) {
            this.totalCountEpics.set(+contentRange.split('/')[1]);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.epicsError.set(true);
          this.epicsIsLoadding.set(false);
        },
      });
  }
  getEpicsProject(projectId: string) {
    return this.httpClient
      .get<IEpicsProject[]>(`${APIS_KEYS.projects.getEpics}?project_id=eq.${projectId}`)
      .subscribe({
        next: (resp) => {
          this.epics.set(resp);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }
  createNewtTask(taskInfo: {}) {
    return this.httpClient.post(APIS_KEYS.projects.NewTask, taskInfo);
  }
  // get epics Details
  getEpicsDetails(projectID: string, epicID: string) {
    return this.httpClient.get<IEpicDetails[]>(
      `${APIS_KEYS.projects.getEpics}?project_id=eq.${projectID}&&id=eq.${epicID}`
    );
  }
  updateEpic(editInfo: Partial<IEpicDetails>, epicId: string) {
    return this.httpClient.patch(`${APIS_KEYS.projects.updateEpic}?id=eq.${epicId}`, editInfo);
  }
  patchLocalEpic(epicId: string, partial: Partial<IEpicsProject>) {
    this.allEpics.update((epics) =>
      epics.map((epic) => (epic.id === epicId ? { ...epic, ...partial } : epic))
    );
  }
  // get epicTasks
  getEpicTasks(epicId: string) {
    return this.httpClient.get<IEpicTasks[]>(
      `${APIS_KEYS.projects.getEpicTasks}?epic_id=eq.${epicId}`
    );
  }
}
