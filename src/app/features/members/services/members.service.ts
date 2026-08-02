import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { APIS_KEYS } from '../../../core/constants/APIS_KEYS';
import { Member } from '../interfaces/IMembers';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private readonly httpClient = inject(HttpClient);
  showModelInviteMember = signal<boolean>(false);

  // get all member
  getAllMembers(idProject: string) {
    return this.httpClient.get<Member[]>(
      `${APIS_KEYS.projects.allMembers}?project_id=eq.${idProject}`
    );
  }

  // invite Member
  inviteMember(infoMember: {}) {
    return this.httpClient.post(APIS_KEYS.projects.inviteMember, infoMember);
  }

  // accept Invitation
  AcceptInvitation(token: {}) {
    return this.httpClient.post(APIS_KEYS.projects.acceptInvitation, token);
  }
}
