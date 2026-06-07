import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductListItem, Category } from '../../../shared/models/product.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  template: `
    <div class="shop-page">
      <div class="container">
        <h1>Shop</h1>

        <!-- Filters -->
        <div class="filters">
          <input type="search" placeholder="Search products..." [(ngModel)]="search" (ngModelChange)="onFilter()">
          <select [(ngModel)]="selectedCategory" (ngModelChange)="onFilter()">
            <option [ngValue]="null">All Categories</option>
            @for (cat of categories(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>

        <!-- Results -->
        @if (loading()) {
          <p class="loading">Loading products...</p>
        } @else if (products().length === 0) {
          <p class="empty">No products found.</p>
        } @else {
          <p class="count">{{ totalCount() }} products</p>
          <div class="product-grid">
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <button [disabled]="page === 1" (click)="changePage(page - 1)">← Prev</button>
              <span>Page {{ page }} of {{ totalPages() }}</span>
              <button [disabled]="page === totalPages()" (click)="changePage(page + 1)">Next →</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .shop-page { padding: 3rem 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 1.5rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filters input, .filters select {
      padding: 0.6rem 1rem; border: 1px solid #ddd; border-radius: 8px;
      font-size: 0.95rem; flex: 1; min-width: 160px;
    }
    .count { color: #999; font-size: 0.9rem; margin-bottom: 1rem; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
    .loading, .empty { text-align: center; color: #999; padding: 4rem; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 2.5rem; }
    .pagination button {
      padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 6px;
      cursor: pointer; background: #fff;
    }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class ShopComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<ProductListItem[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  totalPages = signal(1);
  page = 1;
  search = '';
  selectedCategory: number | null = null;

  ngOnInit() {
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));
    this.loadProducts();
  }

  onFilter() { this.page = 1; this.loadProducts(); }

  changePage(p: number) { this.page = p; this.loadProducts(); }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts(this.page, 20, this.selectedCategory ?? undefined, this.search || undefined)
      .subscribe({
        next: res => {
          this.products.set(res.items);
          this.totalCount.set(res.totalCount);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }
}
