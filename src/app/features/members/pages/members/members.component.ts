import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Member } from '../../interfaces/IMembers';
import { HttpErrorResponse } from '@angular/common/http';
import { MemberCardSkelttonComponent } from '../../components/member-card-skeltton/member-card-skeltton.component';
import { MemberCardComponent } from '../../components/member-card/member-card.component';
import { HandleErrorComponent } from '../../../projects/components/handle-error/handle-error.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { Subject, takeUntil } from 'rxjs';
import { InviteMemberFormComponent } from '../invite-member-form/invite-member-form.component';
import { MembersService } from '../../services/members.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    MemberCardSkelttonComponent,
    MemberCardComponent,
    HandleErrorComponent,
    BreadcrumbComponent,
    InviteMemberFormComponent,
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit, OnDestroy {
  private readonly memberServices = inject(MembersService);
  private readonly activateRoute = inject(ActivatedRoute);
  allMembers = signal<Member[] | null>(null);
  hassError = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  private destroy$ = new Subject<void>();
  projectId = '';

  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => (this.projectId = param.get('projectId')!));
    this.getAllMembers();
  }
  arrPaths = [
    {
      label: 'Members',
      path: `/project/${this.projectId}/members`,
    },
  ];
  getAllMembers() {
    this.hassError.set(false);
    this.isLoading.set(true);
    this.memberServices
      .getAllMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          this.isLoading.set(false);
          this.allMembers.set(resp);
        },
        error: (error: HttpErrorResponse) => {
          this.hassError.set(true);
          this.isLoading.set(false);
        },
      });
  }
  showModel = this.memberServices.showModelInviteMember;
  showModelInvite() {
    this.showModel.set(true);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
