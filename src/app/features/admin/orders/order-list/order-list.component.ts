import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../shared/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="admin-page">
      <div class="container">
        <h1>Orders</h1>
        <div class="filters">
          <input type="search" placeholder="Search by order #, name or email..." [(ngModel)]="search" (ngModelChange)="onSearch()">
          <select [(ngModel)]="statusFilter" (ngModelChange)="load()">
            <option value="">All Statuses</option>
            @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
          </select>
        </div>
        @if (loading()) {
          <p class="loading">Loading...</p>
        } @else {
          <table class="table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td>{{ order.orderNumber }}</td>
                  <td>{{ order.guestFirstName }} {{ order.guestLastName }}</td>
                  <td>{{ order.createdAt | date:'dd MMM yyyy' }}</td>
                  <td>{{ order.total | currency:'ZAR':'R ' }}</td>
                  <td><span [class]="'badge ' + order.status.toLowerCase()">{{ order.status }}</span></td>
                  <td><a [routerLink]="['/admin/orders', order.id]" class="link-btn">View</a></td>
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
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 1.5rem; }
    .filters { margin-bottom: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .filters input { padding: 0.6rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; min-width: 280px; flex: 1; }
    .filters input:focus { outline: none; border-color: #e8468c; }
    .filters select { padding: 0.6rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; }
    .table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .table th { background: #f8f8f8; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; color: #666; border-bottom: 1px solid #eee; }
    .table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .badge.pending    { background: #fff9e6; color: #f39c12; }
    .badge.processing { background: #e8f4fd; color: #2980b9; }
    .badge.shipped    { background: #eafaf1; color: #27ae60; }
    .badge.delivered  { background: #d5f5e3; color: #1e8449; }
    .badge.cancelled  { background: #fdf0f0; color: #e74c3c; }
    .link-btn { background: none; border: none; color: #e8468c; cursor: pointer; text-decoration: underline; font-size: 0.9rem; }
    .loading { padding: 3rem; text-align: center; color: #999; }
    .pagination { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1.5rem; }
    .pagination button { padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  totalPages = signal(1);
  page = 1;
  statusFilter = '';
  search = '';
  statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  private searchTimer: any;

  ngOnInit() { this.load(); }
  changePage(p: number) { this.page = p; this.load(); }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.load(); }, 350);
  }

  load() {
    this.loading.set(true);
    this.orderService.getAdminOrders(this.page, 20, this.statusFilter || undefined, this.search || undefined)
      .subscribe({ next: res => { this.orders.set(res.items); this.totalPages.set(res.totalPages); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
}
