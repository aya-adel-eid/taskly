import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../interfaces/IMembers';
import { HttpErrorResponse } from '@angular/common/http';
import { MemberCardSkelttonComponent } from '../../components/member-card-skeltton/member-card-skeltton.component';
import { MemberCardComponent } from '../../components/member-card/member-card.component';
import { HandleErrorComponent } from '../../components/handle-error/handle-error.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    MemberCardSkelttonComponent,
    MemberCardComponent,
    HandleErrorComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit, OnDestroy {
  private readonly projectServices = inject(ProjectsService);
  private readonly activateRoute = inject(ActivatedRoute);
  allMembers = signal<Member[] | null>(null);
  hassError = signal<boolean>(false);
  private destroy$ = new Subject<void>();
  projectId = '';
  arrPaths = [
    {
      label: 'Members',
      path: `/project/${this.projectId}/members`,
    },
  ];
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => (this.projectId = param.get('projectId')!));
    this.getAllMembers();
  }
  getAllMembers() {
    this.hassError.set(false);
    console.log(this.projectServices.selectedProjectId());

    this.projectServices
      .getAllMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          console.log(resp);
          this.allMembers.set(resp);
        },
        error: (error: HttpErrorResponse) => {
          this.hassError.set(true);
        },
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
