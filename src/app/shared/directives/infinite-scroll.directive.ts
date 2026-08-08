import { Directive, HostListener, input, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective {
  disabled = input(false);
  threshold = input(150);

  scrolled = output<void>();

  @HostListener('window:scroll')
  onScroll() {
    if (this.disabled()) return;

    const reachedBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - this.threshold();

    if (reachedBottom) {
      this.scrolled.emit();
    }
  }
}
