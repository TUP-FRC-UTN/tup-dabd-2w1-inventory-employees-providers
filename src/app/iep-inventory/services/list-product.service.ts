import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoryDTO, CreateProductDTO, ProductDTO, UpdateProductDTO } from '../models/list-product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListProductService {

  private readonly API_URL = 'http://localhost:8081/products'; // Reemplazar con tu URL base
  private readonly API_URLC = 'http://localhost:8081/categories'; // Ajusta según tu API

    constructor(private http: HttpClient) { }

    getAll(): Observable<CategoryDTO[]> {
      return this.http.get<CategoryDTO[]>(this.API_URL);
  }

    findAll(): Observable<ProductDTO[]> {
        return this.http.get<ProductDTO[]>(this.API_URL);
    }

    findById(id: number): Observable<ProductDTO> {
        return this.http.get<ProductDTO>(`${this.API_URL}/${id}`);
    }

    create(product: CreateProductDTO): Observable<ProductDTO> {
        return this.http.post<ProductDTO>(this.API_URL, product);
    }

    update(id: number, product: UpdateProductDTO): Observable<ProductDTO> {
        return this.http.put<ProductDTO>(`${this.API_URL}/updatebyId/${id}`, product);
    }
}
