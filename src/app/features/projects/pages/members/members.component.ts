import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../interfaces/IMembers';
import { HttpErrorResponse } from '@angular/common/http';
import { MemberCardSkelttonComponent } from "../../components/member-card-skeltton/member-card-skeltton.component";
import { MemberCardComponent } from "../../components/member-card/member-card.component";
import { HandleErrorComponent } from "../../components/handle-error/handle-error.component";

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [MemberCardSkelttonComponent, MemberCardComponent, HandleErrorComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css'
})
export class MembersComponent  implements OnInit{
private readonly projectServices=inject(ProjectsService);
private readonly activateRoute=inject(ActivatedRoute)
allMembers=signal<Member[]|null>(null)
hassError=signal<boolean>(false)
projectId='';
ngOnInit(): void {
  this.activateRoute.paramMap.subscribe((param)=>this.projectId=param.get('projectId')!)
  this.getAllMembers()
}
getAllMembers(){
  this.hassError.set(false)
  console.log(this.projectServices.selectedProjectId());
  
  this.projectServices.getAllMembers(this.projectId).subscribe({
    next:(resp)=>{
      console.log(resp);
      this.allMembers.set(resp)
      
    },
    error:(error:HttpErrorResponse)=>{
this.hassError.set(true)
    }
  })
}

}
