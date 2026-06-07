import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>LadyRuth Admin</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="admin@ladyruth.co.za">
          </div>
          <div class="field">
            <label>Password</label>
            <input formControlName="password" type="password" placeholder="••••••••">
          </div>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fdf0f1; }
    .login-card { background: #fff; border-radius: 12px; padding: 2.5rem; width: 100%; max-width: 380px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { font-family: 'Playfair Display', serif; color: #e8468c; text-align: center; margin-bottom: 2rem; }
    .field { margin-bottom: 1.2rem; }
    .field label { display: block; font-size: 0.85rem; color: #555; margin-bottom: 0.4rem; }
    .field input { width: 100%; padding: 0.7rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; }
    .field input:focus { outline: none; border-color: #e8468c; }
    .error { color: #e74c3c; font-size: 0.85rem; background: #fdf0f0; padding: 0.6rem; border-radius: 6px; margin-bottom: 1rem; }
    button { width: 100%; padding: 0.9rem; background: #e8468c; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: () => { this.error.set('Invalid email or password.'); this.loading.set(false); }
    });
  }
}
