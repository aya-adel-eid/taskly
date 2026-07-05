import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsidBarService {
  projectId=signal<string>('');
  isCollapsed = signal(false);

  toggleCollapse() {
    this.isCollapsed.update(value => !value);
  }
}
