import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <h3>LadyRuth</h3>
          <p>Fashion that speaks to you.</p>
        </div>
        <div class="footer-links">
          <a routerLink="/shop">Shop</a>
          <a routerLink="/cart">Cart</a>
        </div>
        <div class="footer-copy">
          <p>© {{ year }} LadyRuth. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: #2d2d2d; color: #ccc; padding: 2.5rem 0 1.5rem; }
    .footer-container {
      max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;
      display: flex; flex-wrap: wrap; gap: 2rem; justify-content: space-between;
    }
    .footer-brand h3 { font-family: 'Playfair Display', serif; color: #fff; margin: 0 0 0.5rem; }
    .footer-links { display: flex; flex-direction: column; gap: 0.5rem; }
    .footer-links a { color: #ccc; text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: #fff; }
    .footer-copy { width: 100%; border-top: 1px solid #444; padding-top: 1rem; font-size: 0.85rem; }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
