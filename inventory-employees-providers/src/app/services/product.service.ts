import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { ProductCategory } from '../interfaces/product-category';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl: string = 'http://localhost:8080/products';

  constructor(private client1: HttpClient) {
  }

  getAllCategories():Observable<ProductCategory[]> {
    return this.client1.get<ProductCategory[]>
    (`${this.baseUrl}/categories`).pipe(delay(2000));
  }
}
