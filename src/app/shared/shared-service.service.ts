import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedServiceService {
  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
}
