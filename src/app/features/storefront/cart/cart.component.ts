import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="cart-page">
      <div class="container">
        <h1>Your Cart</h1>

        @if (cart.items().length === 0) {
          <div class="empty">
            <p>Your cart is empty.</p>
            <a routerLink="/shop" class="btn-primary">Continue Shopping</a>
          </div>
        } @else {
          <div class="cart-layout">
            <div class="cart-items">
              @for (item of cart.items(); track item.variantId) {
                <div class="cart-item">
                  <div class="item-image">
                    @if (item.imageUrl) {
                      <img [src]="item.imageUrl" [alt]="item.productName">
                    } @else {
                      <div class="img-placeholder">🛍️</div>
                    }
                  </div>
                  <div class="item-info">
                    <h3>{{ item.productName }}</h3>
                    <p>{{ item.colour }} · {{ item.size }}</p>
                    <p class="item-price">{{ item.price | currency:'ZAR':'R ' }}</p>
                  </div>
                  <div class="item-qty">
                    <button (click)="cart.updateQuantity(item.variantId, item.quantity - 1)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="cart.updateQuantity(item.variantId, item.quantity + 1)">+</button>
                  </div>
                  <div class="item-total">{{ item.price * item.quantity | currency:'ZAR':'R ' }}</div>
                  <button class="remove" (click)="cart.removeItem(item.variantId)">✕</button>
                </div>
              }
            </div>

            <div class="cart-summary">
              <h2>Summary</h2>
              <div class="summary-row"><span>Subtotal</span><span>{{ cart.subTotal() | currency:'ZAR':'R ' }}</span></div>
              <div class="summary-row"><span>Shipping</span><span>R 100.00</span></div>
              <div class="summary-row total"><span>Total</span><span>{{ cart.total() | currency:'ZAR':'R ' }}</span></div>
              <a routerLink="/checkout" class="btn-checkout">Proceed to Checkout</a>
              <a routerLink="/shop" class="continue">← Continue Shopping</a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cart-page { padding: 3rem 0; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 2rem; }
    .empty { text-align: center; padding: 4rem; }
    .empty p { color: #999; margin-bottom: 1.5rem; }
    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
    @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } }
    .cart-item {
      display: flex; align-items: center; gap: 1rem; padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }
    .item-image { width: 80px; height: 100px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #f5f5f5; }
    .item-image img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; }
    .item-info { flex: 1; }
    .item-info h3 { margin: 0 0 0.25rem; font-size: 0.95rem; }
    .item-info p { margin: 0; color: #888; font-size: 0.85rem; }
    .item-price { color: #e8468c !important; font-weight: 600; }
    .item-qty { display: flex; align-items: center; gap: 0.5rem; }
    .item-qty button { width: 28px; height: 28px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .item-total { font-weight: 600; min-width: 80px; text-align: right; }
    .remove { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1rem; }
    .remove:hover { color: #e74c3c; }
    .cart-summary { background: #fafafa; border-radius: 10px; padding: 1.5rem; border: 1px solid #eee; }
    .cart-summary h2 { font-family: 'Playfair Display', serif; margin-bottom: 1rem; }
    .summary-row { display: flex; justify-content: space-between; padding: 0.6rem 0; font-size: 0.95rem; }
    .summary-row.total { border-top: 2px solid #eee; font-weight: 700; font-size: 1.05rem; margin-top: 0.5rem; }
    .btn-checkout {
      display: block; background: #e8468c; color: #fff; text-align: center;
      padding: 0.9rem; border-radius: 8px; text-decoration: none;
      font-weight: 600; margin-top: 1.5rem; transition: background 0.2s;
    }
    .btn-checkout:hover { background: #c4307a; }
    .continue { display: block; text-align: center; margin-top: 1rem; color: #888; text-decoration: none; font-size: 0.9rem; }
    .btn-primary {
      display: inline-block; background: #e8468c; color: #fff;
      padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);
}
