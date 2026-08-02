import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { IProject } from '../interfaces/Iprojects';
import { Member } from '../../members/interfaces/IMembers';
import { IEpicsProject } from '../../epics/interfaces/IEpicsProject';
import { IEpicDetails } from '../../epics/interfaces/IEpicDetails';
import { IEpicTasks } from '../interfaces/IEpicTasks';
import { ITask } from '../interfaces/ITask';

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

  totalCountTasks = signal<number>(0);
  tasksIsLoading = signal<boolean>(false);
  tasksError = signal<boolean>(false);
  allTasks = signal<ITask[] | null>(null);
  showTaskDetails = signal<boolean>(false);
  draggedTask = signal<ITask | null>(null);
  draggedFromStatus = signal<string | null>(null);
  dragOverStatus = signal<string | null>(null);

  createNewProject(data: {}) {
    return this.httpClient.post(APIS_KEYS.projects.createnewProject, data);
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

  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  createNewtTask(taskInfo: {}) {
    return this.httpClient.post(APIS_KEYS.projects.NewTask, taskInfo);
  }

  // --- signals dedicated to per-status (board column) fetching ---
  tasksByStatus = signal<Record<string, ITask[]>>({});
  tasksByStatusTotalCount = signal<Record<string, number>>({});
  tasksByStatusLoading = signal<Record<string, boolean>>({});
  tasksByStatusError = signal<Record<string, boolean>>({});
  selectedTask = signal<ITask | null>(null);

  getTasksByStatus(
    projectId: string,
    statu: string,
    limit = 5,
    page = 1,
    append = false,
    searchTerm = ''
  ) {
    const offset = (page - 1) * limit;

    let url = `${APIS_KEYS.projects.getEpicTasks}?project_id=eq.${projectId}&status=eq.${statu}&limit=${limit}&offset=${offset}`;

    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      url += `&title=ilike.%25${encodeURIComponent(trimmedTerm)}%25`;
    }

    this.tasksByStatusLoading.update((state) => ({ ...state, [statu]: true }));
    this.tasksByStatusError.update((state) => ({ ...state, [statu]: false }));

    return this.httpClient
      .get<ITask[]>(url, {
        headers: {
          Prefer: 'count=exact',
        },
        observe: 'response',
      })
      .subscribe({
        next: (resp) => {
          this.tasksByStatus.update((state) => {
            const previous = state[statu] ?? [];
            return {
              ...state,
              [statu]: append ? [...previous, ...(resp.body ?? [])] : (resp.body ?? []),
            };
          });

          this.tasksByStatusLoading.update((state) => ({ ...state, [statu]: false }));
          this.tasksByStatusError.update((state) => ({ ...state, [statu]: false }));

          const contentRange = resp.headers.get('Content-Range');
          if (contentRange) {
            const total = +contentRange.split('/')[1];
            this.tasksByStatusTotalCount.update((state) => ({ ...state, [statu]: total }));
          }
        },
        error: () => {
          this.tasksByStatusError.update((state) => ({ ...state, [statu]: true }));
          this.tasksByStatusLoading.update((state) => ({ ...state, [statu]: false }));
        },
      });
  }

  isloadingTask = signal<boolean>(false);

  getAllTasks(projectId: string, limit = 5, page = 1, append = false, searchTerm = '') {
    const offset = (page - 1) * limit;

    this.tasksIsLoading.set(true);

    let url = `${APIS_KEYS.projects.getEpicTasks}?project_id=eq.${projectId}&limit=${limit}&offset=${offset}`;

    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      url += `&title=ilike.%25${encodeURIComponent(trimmedTerm)}%25`;
    }

    return this.httpClient
      .get<ITask[]>(url, {
        headers: {
          Prefer: 'count=exact',
        },
        observe: 'response',
      })
      .subscribe({
        next: (resp) => {
          this.tasksError.set(false);

          if (append) {
            this.allTasks.update((tasks) => [...(tasks ?? []), ...(resp.body ?? [])]);
          } else {
            this.allTasks.set(resp.body ?? []);
          }

          this.tasksIsLoading.set(false);

          const contentRange = resp.headers.get('Content-Range');
          if (contentRange) {
            this.totalCountTasks.set(+contentRange.split('/')[1]);
          }
        },
        error: () => {
          this.tasksError.set(true);
          this.tasksIsLoading.set(false);
        },
      });
  }

  getTaskDetails(projectId: string, taskId: string) {
    return this.httpClient.get<ITask[]>(
      `${APIS_KEYS.projects.getEpicTasks}?project_id=eq.${projectId}&id=eq.${taskId}`
    );
  }

  updateTask(taskInfo: Partial<ITask>, taskId: string) {
    return this.httpClient.patch(`${APIS_KEYS.projects.updateTasks}?id=eq.${taskId}`, taskInfo);
  }

  currentView = signal<'board' | 'list'>('board');

  patchLocalTask(taskId: string, partial: Partial<ITask>) {
    if (this.allTasks()?.length) {
      this.allTasks.update((tasks) =>
        tasks ? tasks.map((task) => (task.id === taskId ? { ...task, ...partial } : task)) : tasks
      );
    }

    // ===== tasksByStatus =====
    if (Object.keys(this.tasksByStatus()).length > 0) {
      this.tasksByStatus.update((tasksMap) => {
        const updated: typeof tasksMap = { ...tasksMap };

        let foundTask: ITask | null = null;
        let oldStatus: string | null = null;

        for (const status in updated) {
          const task = updated[status]?.find((t) => t.id === taskId);
          if (task) {
            foundTask = task;
            oldStatus = status;
            break;
          }
        }

        if (!foundTask || !oldStatus) return updated;

        const updatedTask = { ...foundTask, ...partial };
        const newStatus = partial.status ?? oldStatus;

        if (newStatus !== oldStatus) {
          updated[oldStatus] = updated[oldStatus]?.filter((t) => t.id !== taskId) ?? [];
          updated[newStatus] = [updatedTask, ...(updated[newStatus] ?? [])];
        } else {
          updated[oldStatus] =
            updated[oldStatus]?.map((t) => (t.id === taskId ? updatedTask : t)) ?? [];
        }

        return updated;
      });
    }
  }
}
