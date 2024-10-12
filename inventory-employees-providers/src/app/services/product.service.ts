import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { ProductCategory } from '../interfaces/product-category';
import { CreateProductDTO } from '../interfaces/create-product-dto';
import { ProductXDetailDTO } from '../interfaces/product-xdetail-dto';
import { HttpHeaders, HttpParams } from '@angular/common/http';

//import { Product } from '../interfaces/product';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/product';


  constructor(private client1: HttpClient) {
  }

  getAllCategories():Observable<ProductCategory[]> {
    return this.client1.get<ProductCategory[]>
    (`http://localhost:8080/category/getAll`);
  }

  createProduct(dto: CreateProductDTO, idUser: number): Observable<any> {
    const url = `${this.apiUrl}/product`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('idUser', idUser.toString());
    const json = JSON.stringify(dto);

    console.log(json);

    return this.client1.post<any>(url, json, { headers, params });
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
