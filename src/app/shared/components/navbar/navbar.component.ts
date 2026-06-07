import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="brand">LadyRuth</a>

        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/shop" routerLinkActive="active">Shop</a></li>
          <li><a routerLink="/track-order" routerLinkActive="active">Track Order</a></li>
        </ul>

        <div class="nav-actions">
          <a routerLink="/cart" class="cart-icon">
            🛍️
            @if (cart.totalItems() > 0) {
              <span class="badge">{{ cart.totalItems() }}</span>
            }
          </a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/admin/dashboard" class="admin-link">Admin</a>
            <button (click)="auth.logout()" class="btn-logout">Logout</button>
          }
        </div>

        <!-- Mobile menu toggle -->
        <button class="menu-toggle" (click)="menuOpen = !menuOpen">☰</button>
      </div>

      @if (menuOpen) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="menuOpen=false">Home</a>
          <a routerLink="/shop" (click)="menuOpen=false">Shop</a>
          <a routerLink="/cart" (click)="menuOpen=false">Cart ({{ cart.totalItems() }})</a>
          <a routerLink="/track-order" (click)="menuOpen=false">Track Order</a>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .brand {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: #e8468c;
      text-decoration: none;
      margin-right: auto;
    }
    .nav-links {
      list-style: none;
      display: flex;
      gap: 1.5rem;
      margin: 0; padding: 0;
    }
    .nav-links a {
      text-decoration: none;
      color: #444;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a.active, .nav-links a:hover { color: #e8468c; }
    .nav-actions { display: flex; align-items: center; gap: 1rem; }
    .cart-icon { position: relative; font-size: 1.4rem; text-decoration: none; }
    .badge {
      position: absolute; top: -8px; right: -10px;
      background: #e8468c; color: #fff;
      border-radius: 50%; width: 18px; height: 18px;
      font-size: 0.65rem; display: flex; align-items: center; justify-content: center;
    }
    .admin-link { color: #444; text-decoration: none; font-size: 0.9rem; }
    .btn-logout {
      background: none; border: 1px solid #ccc; border-radius: 4px;
      padding: 4px 10px; cursor: pointer; font-size: 0.85rem;
    }
    .menu-toggle { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    .mobile-menu {
      display: flex; flex-direction: column; padding: 1rem 1.5rem;
      border-top: 1px solid #eee; gap: 0.75rem;
    }
    .mobile-menu a { text-decoration: none; color: #444; font-weight: 500; }
    @media (max-width: 640px) {
      .nav-links { display: none; }
      .menu-toggle { display: block; }
    }
  `]
})
export class NavbarComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  menuOpen = false;
}
