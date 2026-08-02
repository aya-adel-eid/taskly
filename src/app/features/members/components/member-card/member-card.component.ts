import { Component, inject, input } from '@angular/core';
import { Member } from '../../interfaces/IMembers';

import { SharedServiceService } from '../../../../shared/shared-service.service';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.css',
})
export class MemberCardComponent {
  sharedService = inject(SharedServiceService);
  titleRow = ['MEMBER', 'Role', 'Actions'];
  members = input<Member[]>();
}
