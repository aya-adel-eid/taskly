import { Component, inject, input, signal } from '@angular/core';
import { ITask } from '../../interfaces/ITask';
import { ProjectsService } from '../../services/projects.service';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskDetailsPageComponent } from "../../pages/task-details-page/task-details-page.component";
const AVATAR_COLORS = ['#2F6FED', '#7C5CFC', '#FF8A5C', '#1A9D5C', '#E0527A', '#12B3A8'];
@Component({
  selector: 'app-card-task-view',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, TaskDetailsPageComponent],
  templateUrl: './card-task-view.component.html',
  styleUrl: './card-task-view.component.css',
})
export class CardTaskViewComponent {
  task = input<ITask>();
  projectService = inject(ProjectsService);

  get assigneeColor(): string {
    const id = this.task()?.assignee.id;
    if (!id) return AVATAR_COLORS[0];
    return AVATAR_COLORS[this.hashString(id) % AVATAR_COLORS.length];
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
  get isDelayed(): boolean {
    const dueDate = this.task()?.due_date;
    if (!dueDate) return false;
    if (this.isToday) return false; // today isn't "delayed" yet
    return new Date(dueDate).getTime() < Date.now();
  }

  /** True when due_date falls on today's calendar date */
  get isToday(): boolean {
    const dueDate = this.task()?.due_date;
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    );
  }
   taskDetails=this.projectService.selectedTask
showDetails=this.projectService.showTaskDetails

    getTaskDetails(projectId:string,taskId:string){
      this.taskDetails.set(null)
    this.projectService.getTaskDetails(projectId,taskId).subscribe({
next:(resp)=>{
  this.taskDetails.set(resp[0])
  
  this.showDetails.set(true)
  console.log(this.taskDetails(),444);
  
},
error:(error:HttpErrorResponse)=>{
  console.log(error);
  
}
    })
  }
    
}
