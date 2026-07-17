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
        <button class="btn-primary" (click)="openForm()">+ Add</button>
      </div>

      @if (loading()) {
        <p class="loading">Loading...</p>
      } @else {
        <div class="grid">
          @for (t of testimonials(); track t.id) {
            <div class="card">
              <div class="card-photo">
                @if (t.hasImage) {
                  <img [src]="svc.imageUrl(t.id)" alt="Photo" />
                } @else {
                  <div class="no-photo">No photo</div>
                }
              </div>
              <p class="card-quote">{{ t.quote }}</p>
              <div class="card-actions">
                <span class="badge" [class.active]="t.isActive" [class.inactive]="!t.isActive">
                  {{ t.isActive ? 'Visible' : 'Hidden' }}
                </span>
                <button class="btn-sm" (click)="openForm(t)">Edit</button>
                <button class="btn-sm danger" (click)="delete(t)">Delete</button>
              </div>
            </div>
          } @empty {
            <p class="empty">No testimonials yet.</p>
          }
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

            <div class="photo-section">
              @if (imagePreview() || editing()?.hasImage) {
                <div class="photo-preview-wrap">
                  <img [src]="imagePreview() || svc.imageUrl(editing()!.id)" alt="Preview" />
                  <button class="remove-photo" (click)="removePhoto()">✕</button>
                </div>
              } @else {
                <label class="photo-upload" for="photoInput">
                  <span>📷</span>
                  <span>Upload photo</span>
                  <span class="upload-hint">JPG, PNG — max 5 MB</span>
                </label>
                <input id="photoInput" type="file" accept="image/*" (change)="onFileSelected($event)" style="display:none" />
              }
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea [(ngModel)]="form.quote" rows="3" placeholder="Short description or quote..."></textarea>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="form.isActive" />
                Show on website
              </label>
            </div>

            @if (error()) { <p class="error">{{ error() }}</p> }

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
    .btn-primary { background: #e8468c; color: #fff; border: none; padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline { background: transparent; border: 2px solid #e8468c; color: #e8468c; padding: 0.6rem 1.4rem; border-radius: 8px; cursor: pointer; font-weight: 600; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem; }
    .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; flex-direction: column; }
    .card-photo { height: 160px; background: #fce7f3; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .card-photo img { width: 100%; height: 100%; object-fit: cover; }
    .no-photo { color: #ccc; font-size: 0.85rem; }
    .card-quote { padding: 0.85rem 1rem 0.5rem; font-size: 0.88rem; color: #444; font-style: italic; line-height: 1.55; flex: 1; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .card-actions { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-top: 1px solid #f5f5f5; flex-wrap: wrap; }
    .badge { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 20px; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.inactive { background: #f3f4f6; color: #6b7280; }
    .btn-sm { font-size: 0.78rem; padding: 0.25rem 0.65rem; border-radius: 6px; cursor: pointer; border: 1px solid #e8468c; background: #fff; color: #e8468c; }
    .btn-sm.danger { border-color: #ef4444; color: #ef4444; }
    .btn-sm:hover { opacity: 0.75; }
    .empty { color: #999; }
    .loading { text-align: center; color: #999; padding: 3rem; }

    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
    .modal { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 420px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h2 { margin: 0; font-size: 1.1rem; }
    .close-btn { background: #f5f5f5; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 0.9rem; }

    .photo-section { margin-bottom: 1.25rem; text-align: center; }
    .photo-upload {
      display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
      border: 2px dashed #fbcfe8; border-radius: 12px; padding: 2rem 1rem;
      cursor: pointer; color: #aaa; transition: border-color 0.2s, background 0.2s;
    }
    .photo-upload:hover { border-color: #e8468c; background: #fff0f6; color: #e8468c; }
    .upload-hint { font-size: 0.72rem; color: #ccc; }
    .photo-preview-wrap { position: relative; display: inline-block; }
    .photo-preview-wrap img { width: 130px; height: 130px; border-radius: 10px; object-fit: cover; border: 2px solid #fce7f3; display: block; }
    .remove-photo { position: absolute; top: -8px; right: -8px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; }

    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #444; margin-bottom: 0.35rem; }
    .form-group textarea { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; box-sizing: border-box; font-family: inherit; resize: vertical; }
    .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: normal; }
    .checkbox-group input[type="checkbox"] { width: auto; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .error { color: #ef4444; font-size: 0.85rem; margin-bottom: 0.5rem; }
  `]
})
export class TestimonialsComponent implements OnInit {
  svc = inject(TestimonialService);

  testimonials = signal<Testimonial[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editing = signal<Testimonial | null>(null);
  error = signal('');
  imagePreview = signal<string | null>(null);
  pendingImageFile = signal<File | null>(null);
  removeImageOnSave = signal(false);

  form: UpsertTestimonial = this.emptyForm();

  readonly avatarGradients = [
    'linear-gradient(135deg, #e8468c, #f472b6)',
    'linear-gradient(135deg, #c4307a, #e8468c)',
    'linear-gradient(135deg, #f472b6, #fbcfe8)',
    'linear-gradient(135deg, #9d1461, #c4307a)',
  ];
  avatarBg(name: string) { return this.avatarGradients[name.charCodeAt(0) % this.avatarGradients.length]; }
  initials(name: string) { return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2); }

  ngOnInit() { this.load(); }

  load() {
    this.svc.getAll().subscribe({
      next: list => { this.testimonials.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(t?: Testimonial) {
    this.editing.set(t ?? null);
    this.form = t ? { customerName: t.customerName, quote: t.quote, productName: t.productName ?? '', rating: t.rating, isActive: t.isActive, sortOrder: t.sortOrder } : this.emptyForm();
    this.imagePreview.set(null);
    this.pendingImageFile.set(null);
    this.removeImageOnSave.set(false);
    this.error.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pendingImageFile.set(file);
    this.removeImageOnSave.set(false);
    const reader = new FileReader();
    reader.onload = e => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.imagePreview.set(null);
    this.pendingImageFile.set(null);
    this.removeImageOnSave.set(true);
  }

  save() {
    if (!this.form.quote.trim()) {
      this.error.set('Description is required.');
      return;
    }
    this.saving.set(true);
    this.error.set('');

    const req = this.editing()
      ? this.svc.update(this.editing()!.id, this.form)
      : this.svc.create(this.form);

    req.subscribe({
      next: (saved: any) => {
        const id = saved.id;
        const imageFile = this.pendingImageFile();
        const shouldRemove = this.removeImageOnSave() && this.editing()?.hasImage;

        if (imageFile) {
          this.svc.uploadImage(id, imageFile).subscribe({ next: () => this.finish(), error: () => this.finish() });
        } else if (shouldRemove) {
          this.svc.removeImage(id).subscribe({ next: () => this.finish(), error: () => this.finish() });
        } else {
          this.finish();
        }
      },
      error: () => { this.saving.set(false); this.error.set('Failed to save. Please try again.'); }
    });
  }

  private finish() { this.saving.set(false); this.closeForm(); this.load(); }

  delete(t: Testimonial) {
    if (!confirm(`Delete testimonial from ${t.customerName}?`)) return;
    this.svc.delete(t.id).subscribe(() => this.load());
  }

  private emptyForm(): UpsertTestimonial {
    return { customerName: '', quote: '', productName: '', rating: 5, isActive: true, sortOrder: 0  };
  }
}
