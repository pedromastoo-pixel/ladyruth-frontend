import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { Testimonial, UpsertTestimonial } from '../../../shared/models/testimonial.model';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Testimonials</h1>
        <button class="btn-primary" (click)="openForm()">+ Add Testimonial</button>
      </div>

      @if (loading()) {
        <p class="loading">Loading...</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Quote</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (t of testimonials(); track t.id) {
                <tr>
                  <td><strong>{{ t.customerName }}</strong></td>
                  <td class="quote-cell">{{ t.quote }}</td>
                  <td>{{ t.productName || '—' }}</td>
                  <td>{{ '★'.repeat(t.rating) }}</td>
                  <td>{{ t.sortOrder }}</td>
                  <td>
                    <span class="badge" [class.active]="t.isActive" [class.inactive]="!t.isActive">
                      {{ t.isActive ? 'Active' : 'Hidden' }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn-sm" (click)="openForm(t)">Edit</button>
                    <button class="btn-sm danger" (click)="delete(t)">Delete</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="empty">No testimonials yet. Add your first one!</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal -->
      @if (showForm()) {
        <div class="overlay" (click)="closeForm()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editing() ? 'Edit' : 'Add' }} Testimonial</h2>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>

            <div class="form-group">
              <label>Customer Name *</label>
              <input [(ngModel)]="form.customerName" placeholder="e.g. Naledi M." />
            </div>
            <div class="form-group">
              <label>Quote *</label>
              <textarea [(ngModel)]="form.quote" rows="4" placeholder="What did they say?"></textarea>
            </div>
            <div class="form-group">
              <label>Product (optional)</label>
              <input [(ngModel)]="form.productName" placeholder="e.g. Floral Wrap Dress" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Rating</label>
                <select [(ngModel)]="form.rating">
                  <option [value]="5">★★★★★ (5)</option>
                  <option [value]="4">★★★★ (4)</option>
                  <option [value]="3">★★★ (3)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Sort Order</label>
                <input type="number" [(ngModel)]="form.sortOrder" min="0" />
              </div>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="form.isActive" />
                Show on website
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
    .page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; margin: 0; }
    .btn-primary {
      background: #e8468c; color: #fff; border: none;
      padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline {
      background: transparent; border: 2px solid #e8468c; color: #e8468c;
      padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600;
    }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    th { background: #fce7f3; color: #c4307a; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.85rem 1rem; text-align: left; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid #f5f5f5; font-size: 0.9rem; vertical-align: middle; }
    .quote-cell { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #555; font-style: italic; }
    .badge { font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.65rem; border-radius: 20px; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.inactive { background: #f3f4f6; color: #6b7280; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-sm { font-size: 0.8rem; padding: 0.3rem 0.75rem; border-radius: 6px; cursor: pointer; border: 1px solid #e8468c; background: #fff; color: #e8468c; }
    .btn-sm.danger { border-color: #ef4444; color: #ef4444; }
    .btn-sm:hover { opacity: 0.8; }
    .empty { text-align: center; color: #999; padding: 2rem; }
    .loading { text-align: center; color: #999; padding: 3rem; }

    /* Modal */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
    .modal { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h2 { margin: 0; font-size: 1.2rem; }
    .close-btn { background: #f5f5f5; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 0.9rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #444; margin-bottom: 0.35rem; }
    .form-group input, .form-group textarea, .form-group select {
      width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #e5e7eb; border-radius: 8px;
      font-size: 0.9rem; box-sizing: border-box; font-family: inherit;
    }
    .form-group textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: normal; }
    .checkbox-group input[type="checkbox"] { width: auto; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .error { color: #ef4444; font-size: 0.85rem; margin-bottom: 0.5rem; }
  `]
})
export class TestimonialsComponent implements OnInit {
  private svc = inject(TestimonialService);

  testimonials = signal<Testimonial[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editing = signal<Testimonial | null>(null);
  error = signal('');

  form: UpsertTestimonial = this.emptyForm();

  ngOnInit() { this.load(); }

  load() {
    this.svc.getAll().subscribe({
      next: list => { this.testimonials.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(t?: Testimonial) {
    this.editing.set(t ?? null);
    this.form = t ? {
      customerName: t.customerName,
      quote: t.quote,
      productName: t.productName,
      rating: t.rating,
      isActive: t.isActive,
      sortOrder: t.sortOrder
    } : this.emptyForm();
    this.error.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  save() {
    if (!this.form.customerName.trim() || !this.form.quote.trim()) {
      this.error.set('Customer name and quote are required.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const req = this.editing()
      ? this.svc.update(this.editing()!.id, this.form)
      : this.svc.create(this.form);

    req.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.load(); },
      error: () => { this.saving.set(false); this.error.set('Failed to save. Please try again.'); }
    });
  }

  delete(t: Testimonial) {
    if (!confirm(`Delete testimonial from ${t.customerName}?`)) return;
    this.svc.delete(t.id).subscribe(() => this.load());
  }

  private emptyForm(): UpsertTestimonial {
    return { customerName: '', quote: '', productName: '', rating: 5, isActive: true, sortOrder: 0 };
  }
}
