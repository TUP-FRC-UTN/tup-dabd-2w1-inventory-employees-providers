import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, throwError } from 'rxjs';
import { ProductCategory } from '../interfaces/product-category';
import { DtoProducto } from '../interfaces/dto-producto';
@Injectable({
  providedIn: 'root'
})
 export class ProductService {
   private baseUrl: string = 'http://localhost:8080/products';
   private productUrl : string = 'http://localhost:8080/product/get';
   
   constructor(private client1: HttpClient) {
   }

   getAllCategories():Observable<ProductCategory[]> {
     return this.client1.get<ProductCategory[]>
     (`${this.baseUrl}/categories`).pipe(delay(2000));
   }

   getDtoProducts(category?: number, reusable?: boolean,
    minAmount?: number, maxAmount?: number, name?: string
   ):Observable<DtoProducto[]> {
    let params = new HttpParams();
    
    if (category !== undefined && category !== 0) { params = params.set('category', category) }; 
    if (reusable !== undefined) { params = params.set('reusable', reusable) };
    if (minAmount !== undefined && minAmount !== 0 && minAmount !== null) { params = params.set('minAmount', minAmount.toString()) }
    if (maxAmount !== undefined && maxAmount !== 0 && maxAmount !== null) { params = params.set('maxAmount', maxAmount.toString()) }
    if (name !== undefined && name !== '') { params = params.set('name', name) }

    return this.client1.get<DtoProducto[]>(this.productUrl, { params }).pipe(delay(2000));
  }
}
