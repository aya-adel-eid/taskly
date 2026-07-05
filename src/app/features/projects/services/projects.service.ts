import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { IProject } from '../interfaces/Iprojects';
import { Member } from '../interfaces/IMembers';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
private readonly httpClient=inject(HttpClient)
projectEdit=signal<IProject|null>(null)
allProjects=signal<IProject[]|null>(null)
hasError=signal<boolean>(false)
totalCount=signal<number>(0)
isLoading=signal<boolean>(true)
selectedProjectId=signal<string>('')
createNewProject(data:{}){
return this.httpClient.post(APIS_KEYS.projects.createnewProject,data)
}
// getAllProjects(){
//   return this.httpClient.get<IProject[]>(APIS_KEYS.projects.listProjects)
// }ط
getAllProjects(limit = 5, page = 1, append = false) {
  const offset = (page - 1) * limit;

  this.isLoading.set(true);

  return this.httpClient.get<IProject[]>(
    `${APIS_KEYS.projects.listProjects}?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Prefer: 'count=exact',
      },
      observe: 'response',
    }
  ).subscribe({
    next: (resp) => {
      this.hasError.set(false);

      if (append) {
        this.allProjects.update(current => [
          ...(current ?? []),
          ...(resp.body ?? [])
        ]);
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
    }
  });
}
// edit project
updateProject(id:string,projectEdit:{}){
return this.httpClient.patch(`${APIS_KEYS.projects.editProject}?id=eq.${id}`,projectEdit)
}
getAllMembers(idProject:string ){
  return this.httpClient.get<Member[]>(`${APIS_KEYS.projects.allMembers}?project_id=eq.${idProject}`)
}
// 
  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

}
