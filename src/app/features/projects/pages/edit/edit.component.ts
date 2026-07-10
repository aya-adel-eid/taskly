import { Component } from '@angular/core';
import { ProjectFormComponent } from '../../components/project-form/project-form.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ProjectFormComponent, BreadcrumbComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent {
  arrPath = [{ label: 'EDIT', path: `/project/edit` }];
}
