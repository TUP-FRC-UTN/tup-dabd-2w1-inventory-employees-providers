import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { ProductCategory } from '../interfaces/product-category';
import { CreateProductDTO } from '../interfaces/create-product-dto';
//import { Product } from '../interfaces/product';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://mocki.io/v1/c140fe64-4b7f-458d-acb3-939f10cd9199'; // Reemplaza con la URL real de tu API


  constructor(private client1: HttpClient) {
  }

  getAllCategories():Observable<ProductCategory[]> {
    return this.client1.get<ProductCategory[]>
    (`http://localhost:8080/Category/getAll`);
  }

  createProduct(dto: CreateProductDTO): Observable<any> {
    const json = JSON.stringify(dto);
    console.log(json);
    return this.client1.post<CreateProductDTO>('http://localhost:8080/product/product', json);
  }
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
