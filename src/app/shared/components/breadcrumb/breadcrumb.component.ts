import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
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
export class BreadcrumbComponent {
  arrPaths = input<IBreadcrumbPath[]>();
}
