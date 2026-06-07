import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="confirm-page">
      <div class="container">
        @if (order()) {
          <div class="confirm-card">
            <div class="checkmark">✓</div>
            <h1>Order Placed!</h1>
            <p>Thank you, {{ order()!.guestFirstName }}! Your order has been received.</p>
            <p class="order-num">Order Number: <strong>{{ order()!.orderNumber }}</strong></p>
            <p class="note">A confirmation will be sent to <strong>{{ order()!.guestEmail }}</strong></p>

            <div class="order-items">
              @for (item of order()!.items; track item.id) {
                <div class="oi">
                  <span>{{ item.productName }} ({{ item.colour }}, {{ item.size }}) × {{ item.quantity }}</span>
                  <span>{{ item.lineTotal | currency:'ZAR':'R ' }}</span>
                </div>
              }
              <div class="oi subtotal"><span>Shipping</span><span>{{ order()!.shippingFee | currency:'ZAR':'R ' }}</span></div>
              <div class="oi total"><span>Total</span><span>{{ order()!.total | currency:'ZAR':'R ' }}</span></div>
            </div>

            <div class="action-btns">
              <a [routerLink]="['/track-order', order()!.orderNumber]" class="btn-primary">Track Order</a>
              <a routerLink="/shop" class="btn-secondary">Continue Shopping</a>
            </div>
          </div>
        } @else {
          <p class="loading">Loading order...</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .confirm-page { padding: 4rem 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 0 1.5rem; }
    .confirm-card { text-align: center; background: #fff; border-radius: 12px; padding: 3rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .checkmark { font-size: 3rem; color: #27ae60; margin-bottom: 1rem; background: #eafaf1; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 0.5rem; }
    .order-num { font-size: 1.1rem; margin: 1rem 0 0.5rem; }
    .note { color: #888; font-size: 0.9rem; }
    .order-items { text-align: left; background: #fafafa; border-radius: 8px; padding: 1rem; margin: 2rem 0; }
    .oi { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; border-bottom: 1px solid #eee; }
    .oi.subtotal, .oi.total { border-bottom: none; }
    .oi.total { font-weight: 700; font-size: 1rem; border-top: 2px solid #eee; margin-top: 0.5rem; padding-top: 0.75rem; }
    .action-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 0.5rem; }
    .btn-primary {
      display: inline-block; background: #e8468c; color: #fff;
      padding: 0.85rem 2rem; border-radius: 30px; text-decoration: none;
      font-weight: 600;
    }
    .btn-secondary {
      display: inline-block; background: transparent; color: #e8468c;
      padding: 0.85rem 2rem; border-radius: 30px; text-decoration: none;
      font-weight: 600; border: 2px solid #e8468c;
    }
    .loading { text-align: center; padding: 3rem; color: #999; }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  order = signal<Order | null>(null);

  ngOnInit() {
    const num = this.route.snapshot.paramMap.get('orderNumber')!;
    this.orderService.getOrderByNumber(num).subscribe(o => this.order.set(o));
  }
}
