import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Testimonial, UpsertTestimonial } from '../../shared/models/testimonial.model';

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getActive() {
    return this.http.get<Testimonial[]>(`${this.api}/testimonials`);
  }

  getAll() {
    return this.http.get<Testimonial[]>(`${this.api}/admin/testimonials`);
  }

  create(dto: UpsertTestimonial) {
    return this.http.post<Testimonial>(`${this.api}/admin/testimonials`, dto);
  }

  update(id: number, dto: UpsertTestimonial) {
    return this.http.put<Testimonial>(`${this.api}/admin/testimonials/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/admin/testimonials/${id}`);
  }
}
