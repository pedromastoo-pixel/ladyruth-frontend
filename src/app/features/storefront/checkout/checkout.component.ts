import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { environment } from '../../../../environments/environment';

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
              <input #addressInput formControlName="addressLine1" placeholder="Start typing your address..." autocomplete="off">
              <p class="field-hint">Start typing to search — city, province and postal code will fill automatically.</p>
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

            @if (cancelled()) {
              <div class="cancelled-notice">
                ⚠️ Your payment was cancelled. Please try again or choose a different payment method.
              </div>
            }

            @if (error()) {
              <p class="form-error">{{ error() }}</p>
            }

            <button type="submit" class="btn-place" [disabled]="submitting() || cart.items().length === 0">
              {{ submitting() ? 'Redirecting to PayFast...' : 'Pay with PayFast' }}
            </button>
            <p class="payfast-note">🔒 Secure payment via PayFast. We accept credit/debit cards, EFT, and more.</p>
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
    .payfast-note { text-align: center; font-size: 0.8rem; color: #888; margin-top: 0.75rem; }
    .field-hint { font-size: 0.78rem; color: #aaa; margin: 0.25rem 0 0; }
    .cancelled-notice {
      background: #fff8e1; border: 1px solid #f59e0b; color: #92400e;
      padding: 0.85rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;
    }
    .order-summary { background: #fafafa; border: 1px solid #eee; border-radius: 10px; padding: 1.5rem; }
    .summary-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.75rem 0; border-bottom: 1px solid #eee; gap: 1rem; }
    .si-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .si-info span { font-size: 0.8rem; color: #888; }
    .summary-line { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.95rem; }
    .summary-line.total { border-top: 2px solid #eee; font-weight: 700; margin-top: 0.5rem; font-size: 1.05rem; }
  `]
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  @ViewChild('addressInput') addressInputRef!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  cart = inject(CartService);
  submitting = signal(false);
  error = signal('');
  cancelled = signal(false);

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

  ngOnInit() {
    this.cancelled.set(this.route.snapshot.queryParamMap.get('cancelled') === 'true');
  }

  ngAfterViewInit() {
    this.loadGooglePlaces();
  }

  private loadGooglePlaces() {
    if ((window as any).google?.maps?.places) {
      this.initAutocomplete();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => this.initAutocomplete();
    document.head.appendChild(script);
  }

  private initAutocomplete() {
    const autocomplete = new (window as any).google.maps.places.Autocomplete(
      this.addressInputRef.nativeElement,
      { types: ['address'], componentRestrictions: { country: 'za' } }
    );
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      const get = (type: string) =>
        place.address_components.find((c: any) => c.types.includes(type))?.long_name ?? '';
      const getShort = (type: string) =>
        place.address_components.find((c: any) => c.types.includes(type))?.short_name ?? '';

      const streetNumber = get('street_number');
      const route        = get('route');
      const suburb       = get('sublocality_level_1') || get('sublocality') || get('neighborhood');
      const city         = get('locality') || get('administrative_area_level_2');
      const postalCode   = get('postal_code');
      const provinceName = get('administrative_area_level_1');

      const addressLine1 = [streetNumber, route].filter(Boolean).join(' ') || get('premise');

      this.form.patchValue({
        addressLine1: addressLine1,
        addressLine2: suburb || '',
        city:         city,
        province:     this.mapProvince(provinceName),
        postalCode:   postalCode
      });
    });
  }

  private mapProvince(googleProvince: string): string {
    const map: Record<string, string> = {
      'Gauteng':          'Gauteng',
      'Western Cape':     'Western Cape',
      'KwaZulu-Natal':    'KwaZulu-Natal',
      'Eastern Cape':     'Eastern Cape',
      'Limpopo':          'Limpopo',
      'Mpumalanga':       'Mpumalanga',
      'North West':       'North West',
      'Northern Cape':    'Northern Cape',
      'Free State':       'Free State',
    };
    return map[googleProvince] ?? '';
  }

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
      next: res => {
        this.cart.clear();
        // Build a hidden form and POST to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = res.payFastUrl;
        for (const [key, value] of Object.entries(res.payFastFields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Failed to place order. Please try again.');
        this.submitting.set(false);
      }
    });
  }
}
