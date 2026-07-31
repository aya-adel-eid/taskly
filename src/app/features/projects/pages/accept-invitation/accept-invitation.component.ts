import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { interval, take } from 'rxjs';
import { ToastMassageComponent } from '../../components/toast-massage/toast-massage.component';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [ToastMassageComponent],
  templateUrl: './accept-invitation.component.html',
  styleUrl: './accept-invitation.component.css',
})
export class AcceptInvitationComponent implements OnInit {
  private readonly projectService = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  token = signal<string>('');
  ngOnInit(): void {
    console.log(this.route.snapshot.queryParamMap.get('token'));
    this.token.set(this.route.snapshot.queryParamMap.get('token')!);
  }
  acceptInvitation() {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.projectService
      .AcceptInvitation({
        p_token: this.token(),
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Invitation accepted successfully!');
          interval(1000)
            .pipe(take(5))
            .subscribe(() => {
              this.router.navigateByUrl('/project');
              this.successMessage.set('');
            });
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        },
      });
  }
  private handleError(error: HttpErrorResponse): void {
    const code = error.error?.code;
    const message: string = error.error?.message ?? '';

    if (error.status === 401 || error.status === 403) {
      this.errorMessage.set('You are not authorized to accept this invitation.');
    } else if (message.toLowerCase().includes('expired')) {
      this.errorMessage.set('This invitation has expired.');
    } else if (
      error.status === 404 ||
      message.toLowerCase().includes('invalid') ||
      message.toLowerCase().includes('not found')
    ) {
      this.errorMessage.set('This invitation link is invalid.');
    } else {
      this.errorMessage.set('Failed to accept invitation. Please try again.');
    }
  }
}
