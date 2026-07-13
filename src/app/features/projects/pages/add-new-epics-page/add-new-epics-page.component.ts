import { Component, inject, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { NewEpicsComponent } from '../../components/new-epics/new-epics.component';

@Component({
  selector: 'app-add-new-epics-page',
  standalone: true,
  imports: [BreadcrumbComponent, NewEpicsComponent],
  templateUrl: './add-new-epics-page.component.html',
  styleUrl: './add-new-epics-page.component.css',
})
export class AddNewEpicsPageComponent {
  private readonly activateRoute = inject(ActivatedRoute);
  projectId = signal<string>('');
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => this.projectId.set(param.get('projectId')!));
  }
  arrPaths = [
    {
      label: 'Epics',
      path: `/project/${this.projectId()}/epics`,
    },
    {
      label: 'New Epics',
      path: `/project/${this.projectId()}/epics/new`,
    },
  ];
}
