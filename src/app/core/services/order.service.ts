import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order, PlaceOrderRequest } from '../../shared/models/order.model';
import { PagedResult } from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  placeOrder(order: PlaceOrderRequest) {
    return this.http.post<Order>(`${this.api}/orders`, order);
  }

  getOrderByNumber(orderNumber: string) {
    return this.http.get<Order>(`${this.api}/orders/${orderNumber}`);
  }

  // Admin
  getAdminOrders(page = 1, pageSize = 20, status?: string) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status) params = params.set('status', status);
    return this.http.get<PagedResult<Order>>(`${this.api}/admin/orders`, { params });
  }

  getAdminOrder(id: number) {
    return this.http.get<Order>(`${this.api}/admin/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string, adminNotes?: string) {
    return this.http.patch<Order>(`${this.api}/admin/orders/${id}/status`, { status, adminNotes });
  }
}
