import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <div class="container">
        <h1>Admin Dashboard</h1>
        <div class="cards">
          <a routerLink="/admin/products" class="dash-card">
            <span class="icon">👗</span>
            <h3>Products</h3>
            <p>Manage your product catalogue</p>
          </a>
          <a routerLink="/admin/orders" class="dash-card">
            <span class="icon">📦</span>
            <h3>Orders</h3>
            <p>View and update customer orders</p>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 3rem 0; }
    .container { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 2rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
    .dash-card {
      display: block; text-decoration: none; color: inherit;
      background: #fff; border-radius: 12px; padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07); text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .dash-card:hover { transform: translateY(-4px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
    .icon { font-size: 2.5rem; }
    h3 { margin: 0.75rem 0 0.4rem; font-size: 1.1rem; }
    p { color: #888; font-size: 0.9rem; margin: 0; }
  `]
})
export class DashboardComponent {}
