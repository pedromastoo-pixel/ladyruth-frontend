import { Component, Input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ProductImage } from '../../models/product.model';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [NgClass, ImageUrlPipe],
  template: `
    <div class="carousel">
      <div class="main-image">
        @if (images().length > 0) {
          <img [src]="images()[activeIndex()].url | imageUrl" alt="Product image">
        } @else {
          <div class="no-image">🛍️</div>
        }
        @if (images().length > 1) {
          <button class="arrow left" (click)="prev()">‹</button>
          <button class="arrow right" (click)="next()">›</button>
        }
      </div>
      @if (images().length > 1) {
        <div class="thumbnails">
          @for (img of images(); track img.id; let i = $index) {
            <img [src]="img.url | imageUrl" [ngClass]="{ active: i === activeIndex() }"
                 (click)="activeIndex.set(i)" alt="Thumbnail">
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .main-image { position: relative; aspect-ratio: 3/4; background: #f5f5f5; border-radius: 10px; overflow: hidden; }
    .main-image img { width: 100%; height: 100%; object-fit: cover; }
    .no-image { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 4rem; }
    .arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.85); border: none; border-radius: 50%;
      width: 36px; height: 36px; font-size: 1.4rem; cursor: pointer;
    }
    .left { left: 8px; } .right { right: 8px; }
    .thumbnails { display: flex; gap: 8px; margin-top: 10px; overflow-x: auto; }
    .thumbnails img {
      width: 70px; height: 90px; object-fit: cover; border-radius: 6px;
      cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s;
    }
    .thumbnails img.active { border-color: #e8468c; }
  `]
})
export class ImageCarouselComponent {
  @Input({ required: true }) set productImages(val: ProductImage[]) { this.images.set(val); }
  images = signal<ProductImage[]>([]);
  activeIndex = signal(0);
  prev() { this.activeIndex.update(i => i > 0 ? i - 1 : this.images().length - 1); }
  next() { this.activeIndex.update(i => i < this.images().length - 1 ? i + 1 : 0); }
}
