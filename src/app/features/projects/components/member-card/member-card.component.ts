import { Component, inject, input } from '@angular/core';
import { Member } from '../../interfaces/IMembers';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.css'
})
export class MemberCardComponent {
  projectServices=inject(ProjectsService)
  titleRow = ['MEMBER', 'Role', 'Actions'];
  members = input<Member[]>();
}
