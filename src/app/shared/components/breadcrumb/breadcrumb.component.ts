import { Component, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StORED_KEYS } from '../../../core/constants/STORED_KEYS';
export interface IBreadcrumbPath {
  label: string;
  path: string;
}
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent implements OnInit {
  arrPaths = input<IBreadcrumbPath[]>();
  projectId = signal<string>('');
  projectName = signal<string>('');
  ngOnInit(): void {
    this.projectId.set(sessionStorage.getItem(StORED_KEYS.projectId)!);
    this.projectName.set(sessionStorage.getItem(StORED_KEYS.projectName)!);
  }
}
