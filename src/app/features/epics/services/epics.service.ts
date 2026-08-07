import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { IEpicsProject } from '../interfaces/IEpicsProject';
import { IEpicTasks } from '../../tasks/interfaces/IEpicTasks';
import { IEpicDetails } from '../interfaces/IEpicDetails';

@Injectable({
  providedIn: 'root',
})
export class EpicsService {
  private readonly httpClient = inject(HttpClient);
  epicsIsLoadding = signal<boolean>(false);
  epicsError = signal<boolean>(false);
  allEpics = signal<IEpicsProject[] | null>(null);
  totalCountEpics = signal<number>(0);
  epics = signal<IEpicsProject[] | null>(null);
  showPoupDetail = signal<boolean>(false);
  epic = signal<IEpicDetails | null>(null);
  epicTasks = signal<IEpicTasks[] | null>(null);
  isLoadingEpicTask = signal<boolean>(false);
  hasErrorEpicTask = signal<boolean>(false);
  slectedEpicId = signal<string>('');
  // new epics
  addNewEpics(epicData: {}) {
    return this.httpClient.post(APIS_KEYS.projects.NewEpics, epicData);
  }
  // all epics by project

  getAllEpics(limit = 5, page = 1, append = false, projectId: string, searchTerm = '') {
    const offset = (page - 1) * limit;

    this.epicsIsLoadding.set(true);

    let url = `${APIS_KEYS.projects.getEpics}?project_id=eq.${projectId}&limit=${limit}&offset=${offset}`;

    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      url += `&title=ilike.%25${encodeURIComponent(trimmedTerm)}%25`;
    }

    return this.httpClient
      .get<IEpicsProject[]>(url, {
        headers: {
          Prefer: 'count=exact',
        },
        observe: 'response',
      })
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
      epics ? epics.map((epic) => (epic.id === epicId ? { ...epic, ...partial } : epic)) : epics
    );
  }

  getEpicTasks(epicId: string) {
    return this.httpClient.get<IEpicTasks[]>(
      `${APIS_KEYS.projects.getEpicTasks}?epic_id=eq.${epicId}`
    );
  }
}
