import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  template: `
    @if (order()) {
      <div class="admin-page">
        <div class="container">
          <div class="page-header">
            <h1>Order {{ order()!.orderNumber }}</h1>
            <a routerLink="/admin/orders" class="back">← Back to Orders</a>
          </div>

          <div class="order-layout">
            <!-- Left column -->
            <div>
              <!-- Items -->
              <div class="card">
                <h2>Items</h2>
                @for (item of order()!.items; track item.id) {
                  <div class="order-item">
                    <div class="oi-info">
                      <strong>{{ item.productName }}</strong>
                      <span>{{ item.colour }} · {{ item.size }} · Qty {{ item.quantity }}</span>
                    </div>
                    <span>{{ item.lineTotal | currency:'ZAR':'R ' }}</span>
                  </div>
                }
                <div class="totals">
                  <div class="total-row"><span>Subtotal</span><span>{{ order()!.subTotal | currency:'ZAR':'R ' }}</span></div>
                  <div class="total-row"><span>Shipping</span><span>{{ order()!.shippingFee | currency:'ZAR':'R ' }}</span></div>
                  <div class="total-row grand"><span>Total</span><span>{{ order()!.total | currency:'ZAR':'R ' }}</span></div>
                </div>
              </div>

              <!-- Shipping address -->
              <div class="card">
                <h2>Shipping Address</h2>
                <p>{{ order()!.addressLine1 }}</p>
                @if (order()!.addressLine2) { <p>{{ order()!.addressLine2 }}</p> }
                <p>{{ order()!.city }}, {{ order()!.province }} {{ order()!.postalCode }}</p>
              </div>
            </div>

            <!-- Right column -->
            <div>
              <!-- Customer -->
              <div class="card">
                <h2>Customer</h2>
                <p><strong>{{ order()!.guestFirstName }} {{ order()!.guestLastName }}</strong></p>
                <p>{{ order()!.guestEmail }}</p>
                <p>{{ order()!.guestPhone }}</p>
                <p class="date">Ordered: {{ order()!.createdAt | date:'dd MMM yyyy, HH:mm' }}</p>
              </div>

              <!-- Update Status -->
              <div class="card">
                <h2>Update Status</h2>
                <select [(ngModel)]="newStatus">
                  @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
                </select>
                <textarea [(ngModel)]="adminNotes" placeholder="Admin notes (optional)" rows="3"></textarea>
                <button class="btn-update" (click)="updateStatus()" [disabled]="saving()">
                  {{ saving() ? 'Saving...' : 'Update Status' }}
                </button>
                @if (saveSuccess()) {
                  <p class="feedback success">✓ Status updated successfully.</p>
                }
                @if (saveError()) {
                  <p class="feedback error">✗ Failed to update status. Please try again.</p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <p class="loading">Loading order...</p>
    }
  `,
  styles: [`
    .admin-page { padding: 2.5rem 0; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0; }
    .back { color: #e8468c; text-decoration: none; }
    .order-layout { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
    @media (max-width: 768px) { .order-layout { grid-template-columns: 1fr; } }
    .card { background: #fff; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    h2 { font-size: 0.95rem; color: #666; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .order-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.6rem 0; border-bottom: 1px solid #f0f0f0; }
    .oi-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .oi-info span { font-size: 0.82rem; color: #888; }
    .totals { margin-top: 0.75rem; }
    .total-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.9rem; }
    .total-row.grand { font-weight: 700; border-top: 2px solid #eee; margin-top: 0.5rem; padding-top: 0.75rem; }
    .card p { margin: 0.25rem 0; font-size: 0.9rem; }
    .date { color: #aaa; font-size: 0.82rem; margin-top: 0.5rem; }
    .card select, .card textarea { width: 100%; padding: 0.65rem 0.9rem; border: 1px solid #ddd; border-radius: 7px; font-size: 0.9rem; box-sizing: border-box; margin-bottom: 0.75rem; }
    .btn-update { width: 100%; padding: 0.8rem; background: #e8468c; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-update:disabled { opacity: 0.6; cursor: not-allowed; }
    .feedback { margin: 0.6rem 0 0; font-size: 0.88rem; font-weight: 500; }
    .feedback.success { color: #2f9e44; }
    .feedback.error   { color: #e03131; }
    .loading { text-align: center; padding: 3rem; color: #999; }
  `]
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  order = signal<Order | null>(null);
  saving = signal(false);
  saveSuccess = signal(false);
  saveError = signal(false);
  newStatus = '';
  adminNotes = '';
  statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getAdminOrder(id).subscribe(o => {
      this.order.set(o);
      this.newStatus = o.status;
      this.adminNotes = o.adminNotes ?? '';
    });
  }

  updateStatus() {
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(false);
    this.orderService.updateOrderStatus(this.order()!.id, this.newStatus, this.adminNotes)
      .subscribe({
        next: o => {
          this.order.set(o);
          this.saving.set(false);
          this.saveSuccess.set(true);
          setTimeout(() => this.saveSuccess.set(false), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set(true);
        }
      });
  }
}
