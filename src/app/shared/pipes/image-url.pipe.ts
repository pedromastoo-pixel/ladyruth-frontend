import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Converts a relative API image path (/api/products/images/5) to an absolute URL. */
@Pipe({ name: 'imageUrl', standalone: true })
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    // Already absolute — leave it alone
    if (value.startsWith('http')) return value;
    return `${environment.apiBase}${value}`;
  }
}
