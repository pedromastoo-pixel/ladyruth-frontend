import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

    <!-- Testimonials -->
    <section class="testimonials">
      <div class="container">
        <p class="section-tag">Our Community</p>
        <h2>Ladies Wearing LadyRuth</h2>
        <p class="section-sub">Real buyers, real style. See how our community rocks their looks.</p>

        <div class="carousel-wrap">
          <button class="carousel-btn prev" (click)="prevSlide()" [disabled]="slideIndex() === 0">‹</button>

          <div class="carousel-viewport">
            <div class="carousel-track" [style.transform]="trackTransform()">
              @for (t of testimonials; track t.name) {
                <div class="testimonial-card">
                  <div class="card-inner" (click)="openModal(t)" role="button" tabindex="0" (keydown.enter)="openModal(t)">
                    <div class="buyer-photo">
                      <div class="avatar-placeholder" [style.background]="t.bg">{{ t.initials }}</div>
                      <div class="zoom-hint">🔍 Click to zoom</div>
                      <div class="verified-badge">✓ Verified Buyer</div>
                    </div>
                    <div class="testimonial-body">
                      <div class="stars">★★★★★</div>
                      <p class="quote">"{{ t.quote }}"</p>
                      <div class="buyer-info">
                        <span class="buyer-name">{{ t.name }}</span>
                        <span class="buyer-product">{{ t.product }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <button class="carousel-btn next" (click)="nextSlide()" [disabled]="slideIndex() === maxSlide()">›</button>
        </div>

        <!-- Dots -->
        <div class="carousel-dots">
          @for (d of dotArray(); track $index) {
            <button class="dot" [class.active]="slideIndex() === $index" (click)="slideIndex.set($index)"></button>
          }
        </div>

        <!-- Lightbox modal -->
        @if (activeTestimonial()) {
          <div class="lightbox-overlay" (click)="closeModal()">
            <div class="lightbox-card" (click)="$event.stopPropagation()">
              <button class="lightbox-close" (click)="closeModal()">✕</button>
              <div class="lightbox-avatar" [style.background]="activeTestimonial()!.bg">
                {{ activeTestimonial()!.initials }}
              </div>
              <div class="lightbox-verified">✓ Verified Buyer</div>
              <div class="lightbox-stars">★★★★★</div>
              <p class="lightbox-quote">"{{ activeTestimonial()!.quote }}"</p>
              <p class="lightbox-name">{{ activeTestimonial()!.name }}</p>
              <p class="lightbox-product">{{ activeTestimonial()!.product }}</p>
            </div>
          </div>
        }

        <div class="cta-strip">
          <p>Love your LadyRuth look? <strong>Tag us @ladyruth</strong> to be featured!</p>
          <a routerLink="/shop" class="btn-primary">Shop &amp; Share</a>
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

    /* ── Testimonials ─────────────────────────────────────────────────────── */
    .testimonials {
      background: linear-gradient(160deg, #fff0f6 0%, #fce7f3 100%);
      padding: 5rem 0;
    }
    .section-tag {
      text-align: center; font-size: 0.78rem; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: #e8468c; margin: 0 0 0.75rem;
    }
    .testimonials h2 {
      font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 3vw, 2.4rem);
      text-align: center; margin: 0 0 0.6rem;
    }
    .section-sub { text-align: center; color: #888; margin: 0 0 3rem; }

    /* Carousel */
    .carousel-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .carousel-viewport {
      flex: 1;
      overflow: hidden;
    }
    .carousel-track {
      display: flex;
      transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .testimonial-card {
      flex: 0 0 calc(100% / 3);
      padding: 0 0.65rem;
      box-sizing: border-box;
    }
    /* inner card */
    .testimonial-card > .buyer-photo,
    .testimonial-card > .testimonial-body {
      /* applied via the inner wrapper below */
    }
    .testimonial-card {
      background: transparent;
    }
    .testimonial-card .card-inner {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(232,70,140,0.08);
      transition: transform 0.25s, box-shadow 0.25s;
      height: 100%;
    }
    .testimonial-card .card-inner:hover {
      transform: translateY(-6px);
      box-shadow: 0 10px 32px rgba(232,70,140,0.15);
    }
    .carousel-btn {
      flex-shrink: 0;
      width: 44px; height: 44px;
      border-radius: 50%;
      border: 2px solid #e8468c;
      background: #fff;
      color: #e8468c;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      line-height: 1;
    }
    .carousel-btn:hover:not(:disabled) { background: #e8468c; color: #fff; }
    .carousel-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .carousel-dots {
      display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 2.5rem;
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      border: none; background: #fbcfe8; cursor: pointer; padding: 0;
      transition: all 0.2s;
    }
    .dot.active { background: #e8468c; width: 24px; border-radius: 4px; }
    @media (max-width: 768px) {
      .testimonial-card { flex: 0 0 80%; }
      .carousel-btn { width: 36px; height: 36px; font-size: 1.2rem; }
    }
    @media (max-width: 480px) {
      .testimonial-card { flex: 0 0 90%; }
    }
    .buyer-photo {
      position: relative;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fce7f3;
    }
    .avatar-placeholder {
      width: 110px; height: 110px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem; font-weight: 700; color: #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      border: 4px solid #fff;
    }
    .verified-badge {
      position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
      background: #e8468c; color: #fff;
      font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em;
      padding: 0.3rem 0.75rem; border-radius: 20px; white-space: nowrap;
    }
    .testimonial-body { padding: 1.25rem 1.5rem 1.5rem; }
    .stars { color: #f59f00; font-size: 1rem; letter-spacing: 2px; margin-bottom: 0.6rem; }
    .quote {
      font-size: 0.92rem; color: #444; line-height: 1.7;
      font-style: italic; margin: 0 0 1rem;
    }
    .buyer-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .buyer-name { font-weight: 700; font-size: 0.9rem; color: #2d2d2d; }
    .buyer-product { font-size: 0.78rem; color: #e8468c; font-weight: 500; }

    .cta-strip {
      background: #e8468c;
      border-radius: 16px;
      padding: 2rem 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .cta-strip p { color: #fff; margin: 0; font-size: 1rem; }
    .cta-strip .btn-primary {
      background: #fff; color: #e8468c;
      box-shadow: none; white-space: nowrap;
    }
    .cta-strip .btn-primary:hover { background: #fff0f6; transform: translateY(-2px); }

    /* Zoom hint on hover */
    .card-inner { cursor: pointer; }
    .zoom-hint {
      position: absolute; inset: 0;
      background: rgba(232,70,140,0.55);
      color: #fff; font-size: 0.85rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.25s;
    }
    .card-inner:hover .zoom-hint { opacity: 1; }
    .card-inner:hover .avatar-placeholder { transform: scale(1.05); }
    .avatar-placeholder { transition: transform 0.25s; }

    /* Lightbox */
    .lightbox-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .lightbox-card {
      background: #fff; border-radius: 20px;
      padding: 2.5rem 2rem;
      max-width: 420px; width: 100%;
      text-align: center;
      position: relative;
      animation: zoomIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes zoomIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .lightbox-close {
      position: absolute; top: 1rem; right: 1rem;
      background: #f5f5f5; border: none; border-radius: 50%;
      width: 32px; height: 32px; cursor: pointer;
      font-size: 0.9rem; color: #666;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .lightbox-close:hover { background: #e8468c; color: #fff; }
    .lightbox-avatar {
      width: 140px; height: 140px; border-radius: 50%;
      margin: 0 auto 1rem;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 3rem; font-weight: 700; color: #fff;
      box-shadow: 0 8px 30px rgba(232,70,140,0.3);
      border: 5px solid #fff;
    }
    .lightbox-verified {
      display: inline-block; background: #e8468c; color: #fff;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em;
      padding: 0.3rem 0.8rem; border-radius: 20px; margin-bottom: 1rem;
    }
    .lightbox-stars { color: #f59f00; font-size: 1.3rem; letter-spacing: 3px; margin-bottom: 1rem; }
    .lightbox-quote {
      font-style: italic; color: #444; font-size: 1rem;
      line-height: 1.75; margin-bottom: 1.25rem;
    }
    .lightbox-name { font-weight: 700; font-size: 1.05rem; margin-bottom: 0.25rem; }
    .lightbox-product { color: #e8468c; font-size: 0.85rem; font-weight: 500; margin: 0; }

    @media (max-width: 600px) {
      .cta-strip { text-align: center; justify-content: center; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  featured = signal<ProductListItem[]>([]);
  loading = signal(true);

  readonly visibleCount = 3;
  slideIndex = signal(0);
  maxSlide = computed(() => this.testimonials.length - this.visibleCount);
  dotArray = computed(() => Array(this.testimonials.length - this.visibleCount + 1).fill(0));
  trackTransform = computed(() => `translateX(-${this.slideIndex() * (100 / this.visibleCount)}%)`);
  prevSlide() { this.slideIndex.update(i => Math.max(0, i - 1)); }
  nextSlide() { this.slideIndex.update(i => Math.min(this.maxSlide(), i + 1)); }

  activeTestimonial = signal<typeof this.testimonials[0] | null>(null);
  openModal(t: typeof this.testimonials[0]) { this.activeTestimonial.set(t); }
  closeModal() { this.activeTestimonial.set(null); }

  testimonials = [
    {
      name: 'Naledi M.',
      initials: 'NM',
      bg: 'linear-gradient(135deg, #e8468c, #f472b6)',
      product: 'Floral Wrap Dress',
      quote: 'I wore this to my cousin\'s lobola and got so many compliments! The quality is absolutely stunning — I\'ll be back for more.'
    },
    {
      name: 'Thandi K.',
      initials: 'TK',
      bg: 'linear-gradient(135deg, #c4307a, #e8468c)',
      product: 'Satin Midi Skirt',
      quote: 'Finally a local brand that understands our body shapes. The fit was perfect straight out of the bag. No alterations needed!'
    },
    {
      name: 'Zinhle D.',
      initials: 'ZD',
      bg: 'linear-gradient(135deg, #f472b6, #fbcfe8)',
      product: 'Off-Shoulder Blouse',
      quote: 'The colour is even more beautiful in person. I wore it to my work year-end and felt like the most stylish person in the room.'
    },
    {
      name: 'Ayanda P.',
      initials: 'AP',
      bg: 'linear-gradient(135deg, #9d1461, #c4307a)',
      product: 'Ruched Bodycon Dress',
      quote: 'Ordered on a Tuesday, arrived Thursday! Fast delivery and the packaging was so cute. The dress is a perfect 10.'
    },
  ];

  ngOnInit() {
    this.productService.getProducts(1, 8).subscribe({
      next: res => { this.featured.set(res.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
