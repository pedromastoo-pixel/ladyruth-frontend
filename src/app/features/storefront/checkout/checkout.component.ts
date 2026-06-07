import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="checkout-page">
      <div class="container">
        <h1>Checkout</h1>
        <div class="checkout-layout">
          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="checkout-form">
            <h2>Contact Information</h2>
            <div class="form-row">
              <div class="field">
                <label>First Name *</label>
                <input formControlName="guestFirstName" placeholder="Jane">
                @if (f['guestFirstName'].invalid && f['guestFirstName'].touched) {
                  <span class="error">Required</span>
                }
              </div>
              <div class="field">
                <label>Last Name *</label>
                <input formControlName="guestLastName" placeholder="Doe">
              </div>
            </div>
            <div class="field">
              <label>Email *</label>
              <input formControlName="guestEmail" type="email" placeholder="jane@example.com">
              @if (f['guestEmail'].invalid && f['guestEmail'].touched) {
                <span class="error">Valid email required</span>
              }
            </div>
            <div class="field">
              <label>Phone</label>
              <input formControlName="guestPhone" placeholder="071 234 5678">
            </div>

            <h2>Shipping Address</h2>
            <div class="field">
              <label>Address Line 1 *</label>
              <input formControlName="addressLine1" placeholder="12 Rose Street">
            </div>
            <div class="field">
              <label>Address Line 2</label>
              <input formControlName="addressLine2" placeholder="Apt 3B">
            </div>
            <div class="form-row">
              <div class="field">
                <label>City *</label>
                <input formControlName="city" placeholder="Johannesburg">
              </div>
              <div class="field">
                <label>Province *</label>
                <select formControlName="province">
                  <option value="">Select province</option>
                  @for (p of provinces; track p) { <option [value]="p">{{ p }}</option> }
                </select>
              </div>
            </div>
            <div class="field" style="max-width: 160px">
              <label>Postal Code *</label>
              <input formControlName="postalCode" placeholder="2000">
            </div>

            @if (error()) {
              <p class="form-error">{{ error() }}</p>
            }

            <button type="submit" class="btn-place" [disabled]="submitting() || cart.items().length === 0">
              {{ submitting() ? 'Placing Order...' : 'Place Order' }}
            </button>
          </form>

          <!-- Order Summary -->
          <div class="order-summary">
            <h2>Order Summary</h2>
            @for (item of cart.items(); track item.variantId) {
              <div class="summary-item">
                <div class="si-info">
                  <strong>{{ item.productName }}</strong>
                  <span>{{ item.colour }} · {{ item.size }} · Qty {{ item.quantity }}</span>
                </div>
                <span>{{ item.price * item.quantity | currency:'ZAR':'R ' }}</span>
              </div>
            }
            <div class="summary-line"><span>Subtotal</span><span>{{ cart.subTotal() | currency:'ZAR':'R ' }}</span></div>
            <div class="summary-line"><span>Shipping</span><span>R 100.00</span></div>
            <div class="summary-line total"><span>Total</span><span>{{ cart.total() | currency:'ZAR':'R ' }}</span></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page { padding: 3rem 0; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 2rem; }
    .checkout-layout { display: grid; grid-template-columns: 1fr 360px; gap: 2.5rem; align-items: start; }
    @media (max-width: 768px) { .checkout-layout { grid-template-columns: 1fr; } }
    h2 { font-family: 'Playfair Display', serif; font-size: 1.25rem; margin: 1.5rem 0 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.85rem; color: #555; margin-bottom: 0.35rem; }
    .field input, .field select {
      width: 100%; padding: 0.65rem 0.9rem; border: 1px solid #ddd; border-radius: 7px;
      font-size: 0.95rem; box-sizing: border-box;
    }
    .field input:focus, .field select:focus { outline: none; border-color: #e8468c; }
    .error { color: #e74c3c; font-size: 0.8rem; }
    .form-error { color: #e74c3c; background: #fdf0f0; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; }
    .btn-place {
      width: 100%; padding: 1rem; background: #e8468c; color: #fff;
      border: none; border-radius: 8px; font-size: 1rem; font-weight: 600;
      cursor: pointer; margin-top: 1rem; transition: background 0.2s;
    }
    .btn-place:hover:not(:disabled) { background: #c4307a; }
    .btn-place:disabled { opacity: 0.6; cursor: not-allowed; }
    .order-summary { background: #fafafa; border: 1px solid #eee; border-radius: 10px; padding: 1.5rem; }
    .summary-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.75rem 0; border-bottom: 1px solid #eee; gap: 1rem; }
    .si-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .si-info span { font-size: 0.8rem; color: #888; }
    .summary-line { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.95rem; }
    .summary-line.total { border-top: 2px solid #eee; font-weight: 700; margin-top: 0.5rem; font-size: 1.05rem; }
  `]
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private router = inject(Router);
  cart = inject(CartService);
  submitting = signal(false);
  error = signal('');

  provinces = ['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','North West','Northern Cape','Free State'];

  form = this.fb.group({
    guestFirstName: ['', Validators.required],
    guestLastName:  ['', Validators.required],
    guestEmail:     ['', [Validators.required, Validators.email]],
    guestPhone:     [''],
    addressLine1:   ['', Validators.required],
    addressLine2:   [''],
    city:           ['', Validators.required],
    province:       ['', Validators.required],
    postalCode:     ['', Validators.required]
  });

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.error.set('');
    const v = this.form.value;
    this.orderService.placeOrder({
      guestEmail:     v.guestEmail!,
      guestFirstName: v.guestFirstName!,
      guestLastName:  v.guestLastName!,
      guestPhone:     v.guestPhone ?? '',
      addressLine1:   v.addressLine1!,
      addressLine2:   v.addressLine2 ?? undefined,
      city:           v.city!,
      province:       v.province!,
      postalCode:     v.postalCode!,
      items: this.cart.items().map(i => ({ variantId: i.variantId, quantity: i.quantity }))
    }).subscribe({
      next: order => {
        this.cart.clear();
        this.router.navigate(['/order-confirmation', order.orderNumber]);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Failed to place order. Please try again.');
        this.submitting.set(false);
      }
    });
  }
}
