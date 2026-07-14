import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../shared/models/product.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Categories</h1>
        <button class="btn-primary" (click)="openForm()">+ Add Category</button>
      </div>

      @if (loading()) {
        <p class="loading">Loading...</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of categories(); track c.id) {
                <tr>
                  <td><strong>{{ c.name }}</strong></td>
                  <td class="slug">{{ c.slug }}</td>
                  <td>{{ c.productCount }}</td>
                  <td>
                    <span class="badge" [class.active]="c.isActive" [class.inactive]="!c.isActive">
                      {{ c.isActive ? 'Active' : 'Hidden' }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn-sm" (click)="openForm(c)">Edit</button>
                    <button class="btn-sm danger" (click)="delete(c)" [disabled]="c.productCount > 0" [title]="c.productCount > 0 ? 'Remove all products first' : ''">Delete</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="empty">No categories yet.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showForm()) {
        <div class="overlay" (click)="closeForm()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editing() ? 'Edit' : 'Add' }} Category</h2>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>

            <div class="form-group">
              <label>Name *</label>
              <input [(ngModel)]="form.name" placeholder="e.g. Dresses" (ngModelChange)="autoSlug()" />
            </div>
            <div class="form-group">
              <label>Slug *</label>
              <input [(ngModel)]="form.slug" placeholder="e.g. dresses" />
              <small>Used in URLs. Auto-generated from name.</small>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="form.isActive" />
                Active (visible on store)
              </label>
            </div>

            @if (error()) {
              <p class="error">{{ error() }}</p>
            }

            <div class="modal-footer">
              <button class="btn-outline" (click)="closeForm()">Cancel</button>
              <button class="btn-primary" (click)="save()" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; margin: 0; }
    .btn-primary { background: #e8468c; color: #fff; border: none; padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline { background: transparent; border: 2px solid #e8468c; color: #e8468c; padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    th { background: #fce7f3; color: #c4307a; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.85rem 1rem; text-align: left; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid #f5f5f5; font-size: 0.9rem; vertical-align: middle; }
    .slug { color: #888; font-family: monospace; font-size: 0.85rem; }
    .badge { font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.65rem; border-radius: 20px; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.inactive { background: #f3f4f6; color: #6b7280; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-sm { font-size: 0.8rem; padding: 0.3rem 0.75rem; border-radius: 6px; cursor: pointer; border: 1px solid #e8468c; background: #fff; color: #e8468c; }
    .btn-sm.danger { border-color: #ef4444; color: #ef4444; }
    .btn-sm:disabled { opacity: 0.35; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 2rem; }
    .loading { text-align: center; color: #999; padding: 3rem; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
    .modal { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 440px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h2 { margin: 0; font-size: 1.2rem; }
    .close-btn { background: #f5f5f5; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 0.9rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #444; margin-bottom: 0.35rem; }
    .form-group input { width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; box-sizing: border-box; }
    .form-group small { color: #aaa; font-size: 0.75rem; margin-top: 0.25rem; display: block; }
    .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: normal; }
    .checkbox-group input[type="checkbox"] { width: auto; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .error { color: #ef4444; font-size: 0.85rem; margin-bottom: 0.5rem; }
  `]
})
export class CategoriesComponent implements OnInit {
  private svc = inject(ProductService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editing = signal<Category | null>(null);
  error = signal('');

  form = this.emptyForm();

  ngOnInit() { this.load(); }

  load() {
    this.svc.getAdminCategories().subscribe({
      next: list => { this.categories.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(c?: Category) {
    this.editing.set(c ?? null);
    this.form = c ? { name: c.name, slug: c.slug, isActive: c.isActive } : this.emptyForm();
    this.error.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  autoSlug() {
    if (!this.editing()) {
      this.form.slug = this.form.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
  }

  save() {
    if (!this.form.name.trim() || !this.form.slug.trim()) {
      this.error.set('Name and slug are required.');
      return;
    }
    this.saving.set(true);
    this.error.set('');

    const req = this.editing()
      ? this.svc.updateCategory(this.editing()!.id, this.form)
      : this.svc.createCategory(this.form);

    req.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.load(); },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Failed to save. Slug may already be in use.');
      }
    });
  }

  delete(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.svc.deleteCategory(c.id).subscribe({
      next: () => this.load(),
      error: () => alert('Could not delete this category.')
    });
  }

  private emptyForm() {
    return { name: '', slug: '', isActive: true };
  }
}
