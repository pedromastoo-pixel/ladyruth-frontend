export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  colour: string;
  size: string;
  stockQuantity: number;
  sku?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  createdAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  primaryImageUrl?: string;
  isActive: boolean;
  totalStock: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  productCount: number;
}
