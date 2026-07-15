import { Component, inject, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RusableInputComponent } from '../../../auth/components/rusable-input/rusable-input.component';
import { CardEpicComponent } from '../../components/card-epic/card-epic.component';

@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [BreadcrumbComponent, RusableInputComponent, RouterLink, CardEpicComponent],
  templateUrl: './epics.component.html',
  styleUrl: './epics.component.css',
})
export class EpicsComponent {
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
  ];
}
