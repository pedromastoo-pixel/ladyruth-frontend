import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order.model';

interface StatusStep {
  key: string;
  label: string;
  icon: string;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: 'Pending',    label: 'Order Placed',  icon: '📋', description: 'We\'ve received your order.' },
  { key: 'Processing', label: 'Processing',    icon: '⚙️',  description: 'We\'re preparing your items.' },
  { key: 'Shipped',    label: 'Shipped',       icon: '🚚', description: 'Your order is on the way.' },
  { key: 'Delivered',  label: 'Delivered',     icon: '✅', description: 'Your order has been delivered.' },
];

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe, NgClass],
  template: `
    <div class="track-page">
      <div class="container">
        <h1>Track Your Order</h1>
        <p class="subtitle">Enter your order number to check the latest status.</p>

        <!-- Search form -->
        <form class="search-form" (ngSubmit)="lookup()">
          <input
            [(ngModel)]="searchValue"
            name="orderNumber"
            placeholder="e.g. LR-20260604-ABCD"
            class="search-input"
            [class.input-error]="notFound()"
            autocomplete="off"
          >
          <button type="submit" class="btn-search" [disabled]="loading()">
            {{ loading() ? 'Searching…' : 'Track' }}
          </button>
        </form>

        @if (notFound()) {
          <p class="not-found">No order found with that number. Please double-check and try again.</p>
        }

        @if (order()) {
          <div class="order-card">

            <!-- Header -->
            <div class="order-header">
              <div>
                <p class="order-label">Order Number</p>
                <p class="order-num">{{ order()!.orderNumber }}</p>
              </div>
              <div>
                <p class="order-label">Placed On</p>
                <p class="order-date">{{ order()!.createdAt | date:'d MMM yyyy' }}</p>
              </div>
              <div>
                <p class="order-label">Total</p>
                <p class="order-total">{{ order()!.total | currency:'ZAR':'R ' }}</p>
              </div>
              <span class="status-badge" [ngClass]="statusClass(order()!.status)">
                {{ order()!.status }}
              </span>
            </div>

            <!-- Status timeline -->
            @if (order()!.status !== 'Cancelled') {
              <div class="timeline">
                @for (step of steps; track step.key; let i = $index) {
                  <div class="step" [ngClass]="{
                    'done':   stepIndex(order()!.status) > i,
                    'active': stepIndex(order()!.status) === i
                  }">
                    <div class="step-icon-wrap">
                      <div class="step-icon">{{ step.icon }}</div>
                      @if (i < steps.length - 1) { <div class="step-line"></div> }
                    </div>
                    <p class="step-label">{{ step.label }}</p>
                    @if (stepIndex(order()!.status) === i) {
                      <p class="step-desc">{{ step.description }}</p>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="cancelled-banner">
                ❌ This order has been cancelled. If you have questions, please contact us.
              </div>
            }

            <!-- Admin notes -->
            @if (order()!.adminNotes) {
              <div class="admin-notes">
                <strong>Note from us:</strong> {{ order()!.adminNotes }}
              </div>
            }

            <!-- Items -->
            <div class="section-title">Items</div>
            <div class="items-list">
              @for (item of order()!.items; track item.id) {
                <div class="item-row">
                  <div class="item-info">
                    <span class="item-name">{{ item.productName }}</span>
                    <span class="item-meta">{{ item.colour }} · {{ item.size }} · Qty {{ item.quantity }}</span>
                  </div>
                  <span class="item-price">{{ item.lineTotal | currency:'ZAR':'R ' }}</span>
                </div>
              }
              <div class="cost-row"><span>Subtotal</span><span>{{ order()!.subTotal | currency:'ZAR':'R ' }}</span></div>
              <div class="cost-row"><span>Shipping</span><span>{{ order()!.shippingFee | currency:'ZAR':'R ' }}</span></div>
              <div class="cost-row total"><span>Total</span><span>{{ order()!.total | currency:'ZAR':'R ' }}</span></div>
            </div>

            <!-- Delivery address -->
            <div class="section-title">Delivery Address</div>
            <div class="address-box">
              <p>{{ order()!.guestFirstName }} {{ order()!.guestLastName }}</p>
              <p>{{ order()!.addressLine1 }}</p>
              @if (order()!.addressLine2) { <p>{{ order()!.addressLine2 }}</p> }
              <p>{{ order()!.city }}, {{ order()!.province }}, {{ order()!.postalCode }}</p>
              <p>{{ order()!.guestEmail }}</p>
              @if (order()!.guestPhone) { <p>{{ order()!.guestPhone }}</p> }
            </div>

          </div>
        }

        <div class="back-link">
          <a routerLink="/shop">← Back to Shop</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .track-page { padding: 3rem 0 5rem; min-height: 80vh; background: #fff0f6; }
    .container { max-width: 720px; margin: 0 auto; padding: 0 1.5rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 0.4rem; }
    .subtitle { color: #888; margin-bottom: 2rem; }

    /* Search */
    .search-form { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .search-input {
      flex: 1; padding: 0.75rem 1rem; border: 1.5px solid #ddd;
      border-radius: 8px; font-size: 1rem; transition: border-color 0.2s;
    }
    .search-input:focus { outline: none; border-color: #e8468c; }
    .search-input.input-error { border-color: #e74c3c; }
    .btn-search {
      background: #e8468c; color: #fff; border: none; border-radius: 8px;
      padding: 0 1.8rem; font-size: 1rem; font-weight: 600; cursor: pointer; white-space: nowrap;
    }
    .btn-search:disabled { opacity: 0.6; cursor: not-allowed; }
    .not-found { color: #e74c3c; font-size: 0.9rem; margin-bottom: 1.5rem; }

    /* Order card */
    .order-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); overflow: hidden; margin-top: 1.5rem; }

    /* Header */
    .order-header {
      display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
      padding: 1.5rem; border-bottom: 1px solid #f0f0f0; background: #fff0f6;
    }
    .order-label { font-size: 0.75rem; color: #aaa; margin: 0 0 0.2rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .order-num { font-weight: 700; font-size: 1rem; margin: 0; }
    .order-date, .order-total { font-weight: 600; margin: 0; }
    .order-total { color: #e8468c; }
    .status-badge {
      margin-left: auto; padding: 0.35rem 0.9rem; border-radius: 20px;
      font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .status-pending    { background: #fff8e1; color: #f59f00; }
    .status-processing { background: #e8f4fd; color: #1971c2; }
    .status-shipped    { background: #f0fdf4; color: #2f9e44; }
    .status-delivered  { background: #ebfbee; color: #2f9e44; }
    .status-cancelled  { background: #fff5f5; color: #e03131; }

    /* Timeline */
    .timeline { display: flex; padding: 2rem 1.5rem 1.5rem; gap: 0; }
    .step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .step-icon-wrap { display: flex; align-items: center; width: 100%; }
    .step-icon {
      width: 44px; height: 44px; border-radius: 50%; border: 2px solid #e0e0e0;
      background: #f5f5f5; display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; flex-shrink: 0; transition: all 0.3s; z-index: 1;
    }
    .step-line { flex: 1; height: 2px; background: #e0e0e0; transition: background 0.3s; }
    .step.done .step-icon  { background: #e8468c; border-color: #e8468c; filter: brightness(1.1); }
    .step.done .step-line  { background: #e8468c; }
    .step.active .step-icon { background: #e8468c; border-color: #e8468c; box-shadow: 0 0 0 4px rgba(232,70,140,0.18); }
    .step-label { font-size: 0.78rem; font-weight: 600; color: #888; margin: 0.5rem 0 0; }
    .step.done .step-label, .step.active .step-label { color: #333; }
    .step-desc { font-size: 0.75rem; color: #e8468c; margin: 0.2rem 0 0; }

    .cancelled-banner {
      margin: 1.5rem; padding: 1rem; background: #fff5f5;
      border-radius: 8px; color: #e03131; font-size: 0.95rem;
    }

    .admin-notes {
      margin: 0 1.5rem 0; padding: 0.85rem 1rem; background: #fffbea;
      border-left: 3px solid #f59f00; border-radius: 4px; font-size: 0.9rem; color: #555;
    }

    /* Items */
    .section-title { padding: 1.25rem 1.5rem 0.5rem; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #999; }
    .items-list { padding: 0 1.5rem 1rem; }
    .item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.65rem 0; border-bottom: 1px solid #f0f0f0; }
    .item-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .item-name { font-weight: 600; font-size: 0.95rem; }
    .item-meta { font-size: 0.8rem; color: #999; }
    .item-price { font-weight: 600; white-space: nowrap; }
    .cost-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.9rem; color: #777; }
    .cost-row.total { font-weight: 700; font-size: 1rem; color: #222; border-top: 2px solid #eee; margin-top: 0.5rem; padding-top: 0.75rem; }

    /* Address */
    .address-box { padding: 0 1.5rem 1.5rem; }
    .address-box p { margin: 0.2rem 0; font-size: 0.92rem; color: #555; }

    /* Back */
    .back-link { margin-top: 2rem; }
    .back-link a { color: #e8468c; text-decoration: none; font-size: 0.9rem; }

    @media (max-width: 600px) {
      .search-form { flex-direction: column; }
      .btn-search { padding: 0.75rem; }
      .order-header { gap: 1rem; }
      .status-badge { margin-left: 0; }
      .step-label { font-size: 0.7rem; }
    }
  `]
})
export class OrderTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  searchValue = '';
  order = signal<Order | null>(null);
  loading = signal(false);
  notFound = signal(false);

  readonly steps = STATUS_STEPS;

  ngOnInit() {
    const num = this.route.snapshot.paramMap.get('orderNumber');
    if (num) {
      this.searchValue = num;
      this.fetchOrder(num);
    }
  }

  lookup() {
    const num = this.searchValue.trim();
    if (!num) return;
    this.router.navigate(['/track-order', num]);
    this.fetchOrder(num);
  }

  private fetchOrder(orderNumber: string) {
    this.loading.set(true);
    this.notFound.set(false);
    this.order.set(null);
    this.orderService.getOrderByNumber(orderNumber).subscribe({
      next: o  => { this.order.set(o); this.loading.set(false); },
      error: () => { this.notFound.set(true); this.loading.set(false); }
    });
  }

  stepIndex(status: string): number {
    return STATUS_STEPS.findIndex(s => s.key === status);
  }

  statusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}
