import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { ProductCategory } from '../interfaces/product-category';
//import { Product } from '../interfaces/product';
@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private client1: HttpClient) {
  }

  getAllCategories():Observable<ProductCategory[]> {
    return this.client1.get<ProductCategory[]>
    (`http://localhost:8080/Category/getAll`);
  }

  private apiUrl = 'https://mocki.io/v1/c140fe64-4b7f-458d-acb3-939f10cd9199'; // Reemplaza con la URL real de tu API

/*
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  eliminateProducts(justification: string, productIds: number[]): Observable<any> {
    const payload = {
      justification,
      productIds
    };
    return this.http.post(`${this.apiUrl}/delete`, payload);
  }*/
}
