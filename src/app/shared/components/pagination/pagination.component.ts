import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  page = input.required<number>();
  totalCount = input.required<number>();
  limit = input.required<number>();

  // 'numbers' = أزرار أرقام (زي list-projects)
  // 'compact' = Page X of Y بس (زي tasks table)
  variant = input<'numbers' | 'compact'>('numbers');

  pageChange = output<number>();

  pages = computed(() =>
    Array.from({ length: Math.ceil(this.totalCount() / this.limit()) }, (_, i) => i + 1)
  );

  changePage(p: number) {
    if (p < 1 || p > this.pages().length) return;
    this.pageChange.emit(p);
  }
}
