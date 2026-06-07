import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductListItem } from '../../models/product.model';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ImageUrlPipe],
  template: `
    <a [routerLink]="['/shop', product.id]" class="card">
      <div class="card-image">
        @if (product.primaryImageUrl) {
          <img [src]="product.primaryImageUrl | imageUrl" [alt]="product.name" loading="lazy">
        } @else {
          <div class="placeholder">🛍️</div>
        }
        @if (product.totalStock === 0) {
          <span class="out-of-stock">Out of Stock</span>
        }
      </div>
      <div class="card-body">
        <p class="category">{{ product.categoryName }}</p>
        <h3 class="name">{{ product.name }}</h3>
        <p class="price">{{ product.price | currency:'ZAR':'R ' }}</p>
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: block; text-decoration: none; color: inherit;
      border-radius: 10px; overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover { transform: translateY(-4px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
    .card-image { position: relative; aspect-ratio: 3/4; background: #f5f5f5; overflow: hidden; }
    .card-image img { width: 100%; height: 100%; object-fit: cover; }
    .placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem; }
    .out-of-stock {
      position: absolute; top: 10px; left: 10px;
      background: rgba(0,0,0,0.6); color: #fff;
      padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;
    }
    .card-body { padding: 0.75rem 1rem 1rem; }
    .category { font-size: 0.75rem; color: #999; margin: 0 0 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .name { font-weight: 600; margin: 0 0 0.5rem; font-size: 0.95rem; }
    .price { color: #e8468c; font-weight: 600; margin: 0; }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductListItem;
}
