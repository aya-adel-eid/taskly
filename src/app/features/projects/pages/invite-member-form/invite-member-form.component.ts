import { Component, inject } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-invite-member-form',
  standalone: true,
  imports: [],
  templateUrl: './invite-member-form.component.html',
  styleUrl: './invite-member-form.component.css',
})
export class InviteMemberFormComponent {
  private readonly projectService = inject(ProjectsService);
  close() {
    this.projectService.showModelInviteMember.set(false);
  }
}
