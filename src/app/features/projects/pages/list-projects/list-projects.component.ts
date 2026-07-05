import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ProjectsService } from '../../services/projects.service';
import { CardProjectComponent } from "../../components/card-project/card-project.component";
import { IProject } from '../../interfaces/Iprojects';
import { CardAddProjectStaticComponent } from "../../components/card-add-project-static/card-add-project-static.component";
import { HttpErrorResponse } from '@angular/common/http';
import { HandleErrorComponent } from "../../components/handle-error/handle-error.component";
import { EmptyProjectCardComponent } from "../../components/empty-project-card/empty-project-card.component";
import { ProjectCardSkelttonComponent } from "../../components/project-card-skeltton/project-card-skeltton.component";
import { ViewportScroller } from '@angular/common';
import { distinctUntilChanged, map, tap } from 'rxjs';

@Component({
  selector: 'app-list-projects',
  standalone: true,
  imports: [RouterLink, CardProjectComponent, CardAddProjectStaticComponent, HandleErrorComponent, EmptyProjectCardComponent, ProjectCardSkelttonComponent],
  templateUrl: './list-projects.component.html',
  styleUrl: './list-projects.component.css'
})
export class ListProjectsComponent implements OnInit{
private readonly projectsService = inject(ProjectsService);
private readonly activeRoute = inject(ActivatedRoute);
private readonly viewPortScroller = inject(ViewportScroller);
private readonly router = inject(Router);

page = signal(1);
limit = signal(5);

allProjects = this.projectsService.allProjects;
totalCount = this.projectsService.totalCount;
hasError = this.projectsService.hasError;
isLoading = this.projectsService.isLoading;

isMobile = signal(window.innerWidth < 1024);
selectedProjectId = signal<string | null>(null);
constructor() {
  this.activeRoute.queryParamMap
    .pipe(
      tap(params => {
        this.selectedProjectId.set(params.get('projectId'));
      }),
      map(params => +(params.get('offset') ?? 0)),
      distinctUntilChanged()
    )
    .subscribe(offset => {
      this.page.set(offset / this.limit() + 1);
      this.getAllProjects();
    });
}

ngOnInit(): void {
  this.getAllProjects();
}

@HostListener('window:resize')
onResize() {
  this.isMobile.set(window.innerWidth < 1024);
}

@HostListener('window:scroll')
onScroll() {
  // يشتغل على الموبايل فقط
  if (!this.isMobile()) return;

  // لو لسه بيحمل بيانات
  if (this.isLoading()) return;

  const reachedBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 150;

  if (reachedBottom && this.page() < this.pages.length) {
    this.page.update(p => p + 1);

    this.projectsService.getAllProjects(
      this.limit(),
      this.page(),
      true // append
    );
  }
}

getAllProjects() {
  this.projectsService.getAllProjects(
    this.limit(),
    this.page(),
    false
  );
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
  return Array.from(
    { length: Math.ceil(this.totalCount() / this.limit()) },
    (_, i) => i + 1
  );
}

}
