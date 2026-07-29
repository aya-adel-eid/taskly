import { Component, HostListener, inject, signal } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { combineLatest, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { TaskDetailsPageComponent } from "../task-details-page/task-details-page.component";
import { ITask } from '../../interfaces/ITask';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [DatePipe, TaskDetailsPageComponent],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css',
})
export class ListViewComponent {
  projectservice = inject(ProjectsService);
  projectId = signal<string>('');
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  allTasks = this.projectservice.allTasks;
  totalCount = this.projectservice.totalCountTasks;
  hasError = this.projectservice.tasksError;
  isLoading = this.projectservice.tasksIsLoading;
  page = signal(1);
  limit = signal(5);
  isMobile = signal(window.innerWidth < 1024);
  taskDetails=signal<ITask|null>(null)
showDetails=this.projectservice.showPoupDetail
  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        tap(([params]) => {
          // projectId is a route param (/project/:projectId/tasks), not a query param
          this.projectId.set(params.get('projectId')!);
        }),
        map(([, queryParams]) => +(queryParams.get('offset') ?? 0)),
        distinctUntilChanged(),
        filter(() => !!this.projectId())
      )
      .subscribe((offset) => {
        this.page.set(offset / this.limit() + 1);
        this.getAllTasks();
      });
  }

  getAllTasks() {
    this.projectservice.getAllTasks(this.projectId(), this.limit(), this.page(), false);
  }

  changePage(page: number) {
    this.page.set(page);

    this.router.navigate([], {
      queryParams: {
        offset: (page - 1) * this.limit(),
      },
      queryParamsHandling: 'merge',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  get pages(): number[] {
    return Array.from({ length: Math.ceil(this.totalCount() / this.limit()) }, (_, i) => i + 1);
  }

  @HostListener('window:resize')
  onResize() {
    const wasMobile = this.isMobile();
    this.isMobile.set(window.innerWidth < 1024);
    const isNowDesktop = wasMobile && !this.isMobile();

    if (isNowDesktop) {
      this.page.set(1);

      this.router.navigate([], {
        queryParams: { offset: 0 },
        queryParamsHandling: 'merge',
      });

      this.getAllTasks(); // append = false
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isMobile()) return;

    if (this.isLoading()) return;

    const reachedBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;

    if (reachedBottom && this.page() < this.pages.length) {
      this.page.update((p) => p + 1);

      this.projectservice.getAllTasks(
        this.projectId(),
        this.limit(),
        this.page(),
        true // append
      );
    }
  }
  getTaskDetails(projectId:string,taskId:string){
    this.projectservice.getTaskDetails(projectId,taskId).subscribe({
next:(resp)=>{
  this.taskDetails.set(resp[0])
  this.showDetails.set(true)
},
error:(error:HttpErrorResponse)=>{
  console.log(error);
  
}
    })
  }
}
