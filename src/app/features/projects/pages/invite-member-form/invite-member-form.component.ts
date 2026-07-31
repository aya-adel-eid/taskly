import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';
import { ToastMassageComponent } from '../../components/toast-massage/toast-massage.component';
import { interval, take } from 'rxjs';

@Component({
  selector: 'app-invite-member-form',
  standalone: true,
  imports: [ReactiveFormsModule, ToastMassageComponent],
  templateUrl: './invite-member-form.component.html',
  styleUrl: './invite-member-form.component.css',
})
export class InviteMemberFormComponent implements OnInit {
  private readonly projectService = inject(ProjectsService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  succesMessage = signal<string>('');
  errorMessage = signal<string>('');
  projectId!: string;
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => (this.projectId = param.get('projectId')!));
  }
  inviteMemberForm = this.fb.group({
    p_email: [null, [Validators.required, Validators.email]],
    p_project_id: [sessionStorage.getItem(StORED_KEYS.projectId)],
    p_app_url: ['http://localhost:3000'],
    p_base_url: ['https://abhwzcmvupkoivbmgyve.supabase.co'],
  });

  close() {
    this.projectService.showModelInviteMember.set(false);
  }
  sendInvitation() {
    this.succesMessage.set('');
    this.errorMessage.set('');
    console.log(this.inviteMemberForm.value);
    if (this.inviteMemberForm.valid) {
      this.projectService.inviteMember(this.inviteMemberForm.value).subscribe({
        next: (resp) => {
          console.log('done', resp);
          this.succesMessage.set('Invitation sent successfully');
          interval(1000)
            .pipe(take(5))
            .subscribe(() => {
              this.succesMessage.set('');
            });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set('You dont have permission to invite members to thisproject');
          interval(1000)
            .pipe(take(3))
            .subscribe(() => {
              this.errorMessage.set('');
            });
        },
      });
    }
  }
}
