import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../../shared/models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>([]);

  totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  subTotal   = computed(() => this.items().reduce((sum, i) => sum + i.price * i.quantity, 0));
  total      = computed(() => this.subTotal() + 100); // Fixed R100 shipping

  addItem(item: CartItem) {
    this.items.update(current => {
      const existing = current.find(i => i.variantId === item.variantId);
      if (existing) {
        return current.map(i =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...current, item];
    });
  }

  updateQuantity(variantId: number, quantity: number) {
    if (quantity <= 0) { this.removeItem(variantId); return; }
    this.items.update(current =>
      current.map(i => i.variantId === variantId ? { ...i, quantity } : i)
    );
  }

  removeItem(variantId: number) {
    this.items.update(current => current.filter(i => i.variantId !== variantId));
  }

  clear() {
    this.items.set([]);
  }
}
