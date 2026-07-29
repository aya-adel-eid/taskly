import { Component, effect, inject, input, signal } from '@angular/core';
import { ITask } from '../../interfaces/ITask';
import { IEpicTasks } from '../../interfaces/IEpicTasks';
import { ProjectsService } from '../../services/projects.service';
import { single } from 'rxjs';
import { Member } from '../../interfaces/IMembers';
import { IEpicsProject } from '../../interfaces/IEpicsProject';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-details-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-details-page.component.html',
  styleUrl: './task-details-page.component.css'
})
export class TaskDetailsPageComponent {
task=input<ITask>()
allEpics=signal<IEpicTasks[]>([])
isEditingEpic = signal(false);
currentEpic = signal<IEpicTasks | null>(null);
allMembers=signal<Member[]>([])
 readonly projectServices=inject(ProjectsService)
statues:{value:string,title:string}[] = [
    {
      value: 'TO_DO',
      title: 'To Do',
    },
    {
      value: 'IN_PROGRESS',
      title: 'IN PROGRESS',
    },

    {
      value: 'BLOCKED',
      title: 'BLOCKED',
    },
    {
      value: 'IN_REVIEW',
      title: 'IN REVIEW',
    },
    {
      value: 'READY_FOR_QA',
      title: 'READY FOR QA',
    },
    {
      value: 'REOPENED',
      title: 'REOPENED',
    },
    {
      value: 'READY_FOR_PRODUCTION',
      title: 'READY FOR PRODUCTION',
    },
    {
      value: 'DONE',
      title: 'DONE',
    },
  ];


// بداخل الـ Component
selectedStatus = signal<string>('');

constructor() {
  effect(() => {
    
    this.selectedStatus.set(this.task()?.status ?? '');
  });
}

onStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  this.selectedStatus.set(value);
}

selectEpic(epic: IEpicTasks| null) {
  this.currentEpic.set(epic);
  this.isEditingEpic.set(false);
}
close(){
  this.projectServices.showTaskDetails.set(false)
}
}
