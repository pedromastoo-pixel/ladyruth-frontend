import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { ProductListItem } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  template: `
    <div class="admin-page">
      <div class="container">
        <div class="page-header">
          <h1>Products</h1>
          <a routerLink="/admin/products/new" class="btn-primary">+ Add Product</a>
        </div>

        <div class="filters">
          <input type="search" placeholder="Search..." [(ngModel)]="search" (ngModelChange)="load()">
        </div>

        @if (loading()) {
          <p class="loading">Loading...</p>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of products(); track p.id) {
                <tr>
                  <td>
                    <div class="product-name">
                      @if (p.primaryImageUrl) {
                        <img [src]="p.primaryImageUrl" [alt]="p.name">
                      }
                      <span>{{ p.name }}</span>
                    </div>
                  </td>
                  <td>{{ p.categoryName }}</td>
                  <td>{{ p.price | currency:'ZAR':'R ' }}</td>
                  <td>{{ p.totalStock }}</td>
                  <td><span [class]="p.isActive ? 'badge active' : 'badge inactive'">{{ p.isActive ? 'Active' : 'Inactive' }}</span></td>
                  <td>
                    <a [routerLink]="['/admin/products', p.id, 'edit']" class="link-btn">Edit</a>
                    <button (click)="delete(p)" class="link-btn danger">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>

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
    .admin-page { padding: 2.5rem 0; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0; }
    .btn-primary { background: #e8468c; color: #fff; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .filters { margin-bottom: 1rem; }
    .filters input { padding: 0.6rem 1rem; border: 1px solid #ddd; border-radius: 8px; min-width: 260px; font-size: 0.9rem; }
    .table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .table th { background: #f8f8f8; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; color: #666; border-bottom: 1px solid #eee; }
    .table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; vertical-align: middle; }
    .product-name { display: flex; align-items: center; gap: 0.75rem; }
    .product-name img { width: 40px; height: 50px; object-fit: cover; border-radius: 4px; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .badge.active { background: #eafaf1; color: #27ae60; }
    .badge.inactive { background: #fdf0f0; color: #e74c3c; }
    .link-btn { background: none; border: none; color: #e8468c; cursor: pointer; text-decoration: underline; font-size: 0.9rem; margin-right: 0.5rem; }
    .link-btn.danger { color: #e74c3c; }
    .loading { padding: 3rem; text-align: center; color: #999; }
    .pagination { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1.5rem; }
    .pagination button { padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<ProductListItem[]>([]);
  loading = signal(true);
  totalPages = signal(1);
  page = 1;
  search = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.productService.getAdminProducts(this.page, 20, undefined, this.search || undefined)
      .subscribe({ next: res => { this.products.set(res.items); this.totalPages.set(res.totalPages); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  changePage(p: number) { this.page = p; this.load(); }

  delete(product: ProductListItem) {
    if (!confirm(`Delete "${product.name}"?`)) return;
    this.productService.deleteProduct(product.id).subscribe(() => this.load());
  }
}
