import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProjectFormComponent } from '../../components/project-form/project-form.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { StORED_KEYS } from '../../../../core/constants/STORED_KEYS';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ProjectFormComponent, BreadcrumbComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent implements OnInit {
  projectId = signal<string>('');
  private readonly activatedRoute = inject(ActivatedRoute);
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((param) => {
      this.projectId.set(param.get('projectId')!);
    });
  }
  arrPath = computed(() => [{ label: 'EDIT', path: `/project/${this.projectId()}/edit` }]);
}
