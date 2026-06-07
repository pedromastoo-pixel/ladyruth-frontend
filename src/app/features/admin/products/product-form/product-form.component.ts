import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Category, Product } from '../../../../shared/models/product.model';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ImageUrlPipe],
  template: `
    <div class="admin-page">
      <div class="container">
        <div class="page-header">
          <h1>{{ isEdit ? 'Edit Product' : 'New Product' }}</h1>
          <a routerLink="/admin/products" class="back">← Back</a>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="product-form">
          <!-- Basic Info -->
          <div class="form-section">
            <h2>Basic Info</h2>
            <div class="field">
              <label>Product Name *</label>
              <input formControlName="name" placeholder="e.g. Floral Wrap Dress">
            </div>
            <div class="field">
              <label>Description</label>
              <textarea formControlName="description" rows="4" placeholder="Describe the product..."></textarea>
            </div>
            <div class="form-row">
              <div class="field">
                <label>Price (ZAR) *</label>
                <input formControlName="price" type="number" min="0" step="0.01" placeholder="399.00">
              </div>
              <div class="field">
                <label>Category *</label>
                <select formControlName="categoryId">
                  <option value="">Select category</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
            </div>
            @if (isEdit) {
              <label class="checkbox-label">
                <input type="checkbox" formControlName="isActive"> Active (visible in store)
              </label>
            }
          </div>

          <!-- Variants -->
          <div class="form-section">
            <div class="section-header">
              <h2>Variants (Colour + Size + Stock)</h2>
              <button type="button" class="btn-add-variant" (click)="addVariant()">+ Add Variant</button>
            </div>
            <div class="variants-header">
              <span>Colour</span><span>Size</span><span>Stock</span><span>SKU</span><span></span>
            </div>
            @for (variant of variantsArray.controls; track $index; let i = $index) {
              <div class="variant-row" [formGroupName]="'variants'" >
                <ng-container [formGroupName]="i">
                  <input formControlName="colour" placeholder="Red">
                  <select formControlName="size">
                    @for (s of sizes; track s) { <option [value]="s">{{ s }}</option> }
                  </select>
                  <input formControlName="stockQuantity" type="number" min="0" placeholder="0">
                  <input formControlName="sku" placeholder="SKU-001">
                  <button type="button" class="btn-remove" (click)="removeVariant(i)">✕</button>
                </ng-container>
              </div>
            }
          </div>

          <!-- Images (edit mode) -->
          @if (isEdit && product()) {
            <div class="form-section">
              <h2>Images</h2>
              <div class="images-grid">
                @for (img of product()!.images; track img.id) {
                  <div class="img-thumb">
                    <img [src]="img.url | imageUrl" alt="">
                    @if (img.isPrimary) { <span class="primary-badge">Primary</span> }
                    <button type="button" class="img-remove" (click)="deleteImage(img.id)">✕</button>
                  </div>
                }
              </div>
              <div class="upload-row">
                <input type="file" #fileInput accept="image/*" multiple (change)="uploadImages($event)">
              </div>
            </div>
          }

          @if (error()) { <p class="form-error">{{ error() }}</p> }

          <button type="submit" class="btn-submit" [disabled]="submitting()">
            {{ submitting() ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Product') }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 2.5rem 0; }
    .container { max-width: 860px; margin: 0 auto; padding: 0 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0; }
    .back { color: #e8468c; text-decoration: none; }
    .form-section { background: #fff; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    h2 { font-size: 1rem; margin: 0 0 1rem; color: #444; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.85rem; color: #555; margin-bottom: 0.35rem; }
    .field input, .field select, .field textarea { width: 100%; padding: 0.65rem 0.9rem; border: 1px solid #ddd; border-radius: 7px; font-size: 0.95rem; box-sizing: border-box; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; }
    .btn-add-variant { background: #f0f0f0; border: none; border-radius: 6px; padding: 0.4rem 0.9rem; cursor: pointer; font-size: 0.85rem; }
    .variants-header { display: grid; grid-template-columns: 1fr 80px 80px 1fr 36px; gap: 0.5rem; padding: 0 0 0.4rem; font-size: 0.8rem; color: #888; }
    .variant-row { display: grid; grid-template-columns: 1fr 80px 80px 1fr 36px; gap: 0.5rem; margin-bottom: 0.5rem; }
    .variant-row input, .variant-row select { padding: 0.5rem 0.7rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; }
    .btn-remove { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1rem; }
    .btn-remove:hover { color: #e74c3c; }
    .images-grid { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .img-thumb { position: relative; width: 80px; height: 100px; border-radius: 6px; overflow: hidden; }
    .img-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .primary-badge { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(232,70,140,0.85); color: #fff; font-size: 0.65rem; text-align: center; padding: 2px 0; }
    .img-remove { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 0.7rem; }
    .form-error { color: #e74c3c; background: #fdf0f0; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; }
    .btn-submit { background: #e8468c; color: #fff; border: none; border-radius: 8px; padding: 0.9rem 2.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categories = signal<Category[]>([]);
  product = signal<Product | null>(null);
  submitting = signal(false);
  error = signal('');
  isEdit = false;
  productId: number | null = null;
  sizes = ['S', 'M', 'L', 'XL', '2XL'];

  form = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    price:       [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoryId:  ['', Validators.required],
    isActive:    [true],
    variants:    this.fb.array([])
  });

  get variantsArray() { return this.form.get('variants') as FormArray; }

  ngOnInit() {
    this.productService.getAdminCategories().subscribe(cats => this.categories.set(cats));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.productId = +id;
      this.productService.getAdminProduct(this.productId).subscribe(p => {
        this.product.set(p);
        this.form.patchValue({ name: p.name, description: p.description, price: p.price, categoryId: String(p.categoryId), isActive: p.isActive });
        p.variants.forEach(v => this.variantsArray.push(this.newVariant(v.colour, v.size, v.stockQuantity, v.sku)));
      });
    } else {
      this.addVariant();
    }
  }

  newVariant(colour = '', size = 'M', stock = 0, sku = '') {
    return this.fb.group({ colour: [colour, Validators.required], size: [size], stockQuantity: [stock], sku: [sku] });
  }

  addVariant() { this.variantsArray.push(this.newVariant()); }
  removeVariant(i: number) { this.variantsArray.removeAt(i); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const v = this.form.value;
    const payload = { ...v, categoryId: Number(v.categoryId) };
    const req = this.isEdit
      ? this.productService.updateProduct(this.productId!, payload)
      : this.productService.createProduct(payload);
    req.subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: err => { this.error.set(err.error?.message ?? 'Failed to save.'); this.submitting.set(false); }
    });
  }

  uploadImages(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || !this.productId) return;
    Array.from(files).forEach((file, i) =>
      this.productService.uploadImage(this.productId!, file, i === 0 && this.product()!.images.length === 0)
        .subscribe(() => this.productService.getAdminProduct(this.productId!).subscribe(p => this.product.set(p)))
    );
  }

  deleteImage(imageId: number) {
    this.productService.deleteImage(this.productId!, imageId)
      .subscribe(() => this.productService.getAdminProduct(this.productId!).subscribe(p => this.product.set(p)));
  }
}
