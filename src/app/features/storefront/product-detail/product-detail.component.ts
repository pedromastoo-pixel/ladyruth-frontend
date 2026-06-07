import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ImageCarouselComponent } from '../../../shared/components/image-carousel/image-carousel.component';
import { Product, ProductVariant } from '../../../shared/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass, ImageCarouselComponent],
  template: `
    @if (loading()) {
      <div class="loading-page"><p>Loading...</p></div>
    } @else if (!product()) {
      <div class="loading-page"><p>Product not found. <a routerLink="/shop">Back to shop</a></p></div>
    } @else {
      <div class="detail-page">
        <div class="container">
          <a routerLink="/shop" class="back">← Back to Shop</a>
          <div class="product-layout">
            <!-- Images -->
            <div class="images">
              <app-image-carousel [productImages]="product()!.images" />
            </div>

            <!-- Info -->
            <div class="info">
              <p class="category">{{ product()!.categoryName }}</p>
              <h1>{{ product()!.name }}</h1>
              <p class="price">{{ product()!.price | currency:'ZAR':'R ' }}</p>
              <p class="description">{{ product()!.description }}</p>

              <!-- Colour picker -->
              <div class="option-group">
                <label>Colour: <strong>{{ selectedColour() }}</strong></label>
                <div class="colour-options">
                  @for (colour of colours(); track colour) {
                    <button [ngClass]="{ selected: selectedColour() === colour }"
                            (click)="selectColour(colour)">{{ colour }}</button>
                  }
                </div>
              </div>

              <!-- Size picker -->
              <div class="option-group">
                <label>Size: <strong>{{ selectedSize() }}</strong></label>
                <div class="size-options">
                  @for (size of sizes; track size) {
                    <button
                      [ngClass]="{ selected: selectedSize() === size, unavailable: !isSizeAvailable(size) }"
                      [disabled]="!isSizeAvailable(size)"
                      (click)="selectedSize.set(size)">{{ size }}</button>
                  }
                </div>
              </div>

              <!-- Stock -->
              @if (selectedVariant()) {
                <p class="stock" [ngClass]="{ low: selectedVariant()!.stockQuantity <= 5 }">
                  {{ selectedVariant()!.stockQuantity > 0
                    ? selectedVariant()!.stockQuantity + ' in stock'
                    : 'Out of stock' }}
                </p>
              }

              <!-- Quantity -->
              <div class="qty-row">
                <button (click)="decQty()">−</button>
                <span>{{ qty }}</span>
                <button (click)="incQty()">+</button>
              </div>

              <button class="btn-add" [disabled]="!canAdd()" (click)="addToCart()">
                {{ added() ? '✓ Added to Cart' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-page { padding: 5rem; text-align: center; }
    .detail-page { padding: 2.5rem 0; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    .back { color: #e8468c; text-decoration: none; font-size: 0.9rem; }
    .product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 1.5rem; }
    @media (max-width: 768px) { .product-layout { grid-template-columns: 1fr; } }
    .info .category { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin: 0; }
    .info h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0.5rem 0; }
    .price { font-size: 1.4rem; color: #e8468c; font-weight: 700; margin: 0.5rem 0 1rem; }
    .description { color: #555; line-height: 1.7; }
    .option-group { margin: 1.2rem 0; }
    .option-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: #666; }
    .colour-options, .size-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .colour-options button, .size-options button {
      padding: 0.4rem 0.9rem; border: 1px solid #ddd; border-radius: 6px;
      cursor: pointer; background: #fff; transition: all 0.2s; font-size: 0.9rem;
    }
    .colour-options button.selected, .size-options button.selected { border-color: #e8468c; background: #e8468c; color: #fff; }
    .size-options button.unavailable { opacity: 0.35; cursor: not-allowed; }
    .stock { font-size: 0.9rem; color: #27ae60; } .stock.low { color: #e67e22; }
    .qty-row { display: flex; align-items: center; gap: 1rem; margin: 1rem 0; }
    .qty-row button { width: 34px; height: 34px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 1.1rem; }
    .btn-add {
      width: 100%; padding: 0.9rem; background: #e8468c; color: #fff;
      border: none; border-radius: 8px; font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-add:hover:not(:disabled) { background: #c4307a; }
    .btn-add:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product = signal<Product | null>(null);
  loading = signal(true);
  selectedColour = signal('');
  selectedSize = signal('');
  added = signal(false);
  qty = 1;
  sizes = ['S', 'M', 'L', 'XL', '2XL'];

  colours = signal<string[]>([]);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProduct(id).subscribe({
      next: p => {
        this.product.set(p);
        const uniqueColours = [...new Set(p.variants.map(v => v.colour))];
        this.colours.set(uniqueColours);
        if (uniqueColours.length) this.selectedColour.set(uniqueColours[0]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectColour(colour: string) {
    this.selectedColour.set(colour);
    this.selectedSize.set('');
  }

  isSizeAvailable(size: string): boolean {
    return this.product()?.variants.some(
      v => v.colour === this.selectedColour() && v.size === size && v.stockQuantity > 0
    ) ?? false;
  }

  selectedVariant(): ProductVariant | undefined {
    return this.product()?.variants.find(
      v => v.colour === this.selectedColour() && v.size === this.selectedSize()
    );
  }

  canAdd(): boolean {
    const v = this.selectedVariant();
    return !!v && v.stockQuantity > 0;
  }

  decQty() { if (this.qty > 1) this.qty--; }
  incQty() { this.qty++; }

  addToCart() {
    const p = this.product()!;
    const v = this.selectedVariant()!;
    this.cartService.addItem({
      variantId: v.id,
      productId: p.id,
      productName: p.name,
      colour: v.colour,
      size: v.size,
      price: p.price,
      quantity: this.qty,
      imageUrl: (() => { const u = p.images.find(i => i.isPrimary)?.url ?? p.images[0]?.url; return u ? `${environment.apiBase}${u}` : undefined; })()
    });
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }
}
