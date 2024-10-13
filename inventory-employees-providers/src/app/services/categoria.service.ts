import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductCategory } from '../interfaces/product-category';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  categoryUrl = 'http://localhost:8080/category/getAll'

  constructor(private client: HttpClient) { }

  getCategorias():Observable<ProductCategory[]> {
    return this.client.get<ProductCategory[]>
    (`${this.categoryUrl}`);
  }
}
