export interface Testimonial {
  id: number;
  customerName: string;
  quote: string;
  productName?: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
  hasImage: boolean;
  createdAt: string;
}

export interface UpsertTestimonial {
  customerName: string;
  quote: string;
  productName?: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
}
