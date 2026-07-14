import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Storefront
  {
    path: '',
    loadComponent: () => import('./features/storefront/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/storefront/shop/shop.component').then(m => m.ShopComponent)
  },
  {
    path: 'shop/:id',
    loadComponent: () => import('./features/storefront/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/storefront/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/storefront/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'order-confirmation/:orderNumber',
    loadComponent: () => import('./features/storefront/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
  },
  {
    path: 'track-order',
    loadComponent: () => import('./features/storefront/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent)
  },
  {
    path: 'track-order/:orderNumber',
    loadComponent: () => import('./features/storefront/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent)
  },

  // Admin
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/admin/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
      {
        path: 'testimonials',
        loadComponent: () => import('./features/admin/testimonials/testimonials.component').then(m => m.TestimonialsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
