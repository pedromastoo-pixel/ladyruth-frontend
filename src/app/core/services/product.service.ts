import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult, Product, ProductListItem, Category } from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(page = 1, pageSize = 20, categoryId?: number, search?: string) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResult<ProductListItem>>(`${this.api}/products`, { params });
  }

  getProduct(id: number) {
    return this.http.get<Product>(`${this.api}/products/${id}`);
  }

  getCategories() {
    return this.http.get<Category[]>(`${this.api}/categories`);
  }

  // Admin
  getAdminProducts(page = 1, pageSize = 20, categoryId?: number, search?: string) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResult<ProductListItem>>(`${this.api}/admin/products`, { params });
  }

  getAdminProduct(id: number) {
    return this.http.get<Product>(`${this.api}/admin/products/${id}`);
  }

  createProduct(data: any) {
    return this.http.post<Product>(`${this.api}/admin/products`, data);
  }

  updateProduct(id: number, data: any) {
    return this.http.put<Product>(`${this.api}/admin/products/${id}`, data);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.api}/admin/products/${id}`);
  }

  uploadImage(productId: number, file: File, isPrimary = false) {
    const form = new FormData();
    form.append('file', file);
    form.append('isPrimary', String(isPrimary));
    return this.http.post(`${this.api}/admin/products/${productId}/images`, form);
  }

  deleteImage(productId: number, imageId: number) {
    return this.http.delete(`${this.api}/admin/products/${productId}/images/${imageId}`);
  }

  getAdminCategories() {
    return this.http.get<Category[]>(`${this.api}/admin/categories`);
  }

  createCategory(data: { name: string; slug: string; isActive: boolean }) {
    return this.http.post<Category>(`${this.api}/admin/categories`, data);
  }

  updateCategory(id: number, data: { name: string; slug: string; isActive: boolean }) {
    return this.http.put<Category>(`${this.api}/admin/categories/${id}`, data);
  }

  deleteCategory(id: number) {
    return this.http.delete(`${this.api}/admin/categories/${id}`);
  }
}
