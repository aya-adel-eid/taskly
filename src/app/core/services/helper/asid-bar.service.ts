import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsidBarService {

  isCollapsed = signal(false);

  toggleCollapse() {
    this.isCollapsed.update(value => !value);
  }
}
