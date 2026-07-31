import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [],
  templateUrl: './accept-invitation.component.html',
  styleUrl: './accept-invitation.component.css',
})
export class AcceptInvitationComponent implements OnInit {
  private readonly projectService = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  token = signal<string>('');
  ngOnInit(): void {
    console.log(this.route.snapshot.queryParamMap.get('token'));
    this.token.set(this.route.snapshot.queryParamMap.get('token')!);
  }
  acceptInvitation() {
    this.projectService
      .AcceptInvitation({
        p_token: this.token(),
      })
      .subscribe({
        next: (resp) => {
          console.log(resp);
          this.router.navigateByUrl('/project');
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }
}
