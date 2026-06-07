import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductListItem } from '../../../shared/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-image">
          <img src="assets/images/hero-fashion.png" alt="Fashion illustration" />
        </div>
        <div class="hero-content">
          <p class="hero-tag">New Collection</p>
          <h1>Fashion That<br><span class="highlight">Speaks to a Lady</span></h1>
          <p>Discover the latest styles, colours, and trends curated just for you.</p>
          <a routerLink="/shop" class="btn-primary">Shop Now</a>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured">
      <div class="container">
        <h2>New Arrivals</h2>
        @if (loading()) {
          <p class="loading">Loading...</p>
        } @else {
          <div class="product-grid">
            @for (product of featured(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        }
        <div class="view-all">
          <a routerLink="/shop" class="btn-outline">View All Products</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, #fff0f6 0%, #fce7f3 60%, #fbcfe8 100%);
      overflow: hidden;
    }
    .hero-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      min-height: 560px;
    }
    .hero-image {
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      height: 100%;
      padding-top: 2rem;
    }
    .hero-image img {
      max-height: 560px;
      width: auto;
      object-fit: contain;
      object-position: bottom;
      filter: drop-shadow(0 20px 40px rgba(232,70,140,0.2));
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-12px); }
    }
    .hero-content {
      padding: 4rem 2rem 4rem 3rem;
      text-align: left;
    }
    .hero-tag {
      display: inline-block;
      background: rgba(232,70,140,0.12);
      color: #e8468c;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      margin-bottom: 1.25rem;
    }
    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.2rem, 4.5vw, 3.6rem);
      color: #2d2d2d;
      margin-bottom: 1.25rem;
      line-height: 1.15;
    }
    .highlight {
      color: #e8468c;
      font-style: italic;
    }
    .hero p { font-size: 1.05rem; color: #666; margin-bottom: 2rem; line-height: 1.7; }
    .btn-primary {
      display: inline-block; background: #e8468c; color: #fff;
      padding: 0.9rem 2.5rem; border-radius: 30px; text-decoration: none;
      font-weight: 600; transition: background 0.2s, transform 0.2s;
      box-shadow: 0 4px 20px rgba(232,70,140,0.35);
    }
    .btn-primary:hover { background: #c4307a; transform: translateY(-2px); }
    @media (max-width: 768px) {
      .hero-inner { grid-template-columns: 1fr; min-height: auto; }
      .hero-image { max-height: 340px; overflow: hidden; padding-top: 2rem; }
      .hero-image img { max-height: 320px; }
      .hero-content { padding: 2rem 1.5rem 3rem; text-align: center; }
    }
    .featured { padding: 4rem 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .featured h2 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 2rem; text-align: center; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
    .loading { text-align: center; color: #999; padding: 3rem; }
    .view-all { text-align: center; margin-top: 2.5rem; }
    .btn-outline {
      display: inline-block; border: 2px solid #e8468c; color: #e8468c;
      padding: 0.75rem 2rem; border-radius: 30px; text-decoration: none;
      font-weight: 600; transition: all 0.2s;
    }
    .btn-outline:hover { background: #e8468c; color: #fff; }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  featured = signal<ProductListItem[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.productService.getProducts(1, 8).subscribe({
      next: res => { this.featured.set(res.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
