import { HttpClient,  HttpHeaders,  HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable} from 'rxjs';
import { ProductCategory } from '../interfaces/product-category';
import { DtoProducto } from '../interfaces/dto-producto';
import { Producto } from '../interfaces/producto';
import { CreateProductDtoClass } from '../interfaces/create-product-dto-class';
@Injectable({
  providedIn: 'root'
})
 export class ProductService {
   private apiUrl: string = 'http://localhost:8080/product'; // Tomas C
   private productUrl : string = 'http://localhost:8080/product/get'; // Agus
   private historialAmountUrl = 'http://localhost:8080/amountModification/getAllModifications'; // Enzo
   
   constructor(private http: HttpClient) {
   }

   // TOMAS C
   getAllCategories():Observable<ProductCategory[]> {
     return this.http.get<ProductCategory[]>
     (`http://localhost:8080/category/getAll`);
   }

   // AGUS
   getDtoProducts(category?: number, reusable?: boolean,
    minAmount?: number, maxAmount?: number, name?: string
   ):Observable<DtoProducto[]> {
    let params = new HttpParams();
    
    if (category !== undefined && category !== 0) { params = params.set('category', category) }; 
    if (reusable !== undefined) { params = params.set('reusable', reusable) };
    if (minAmount !== undefined && minAmount !== 0 && minAmount !== null) { params = params.set('minAmount', minAmount.toString()) }
    if (maxAmount !== undefined && maxAmount !== 0 && maxAmount !== null) { params = params.set('maxAmount', maxAmount.toString()) }
    if (name !== undefined && name !== '') { params = params.set('name', name) }

    return this.http.get<DtoProducto[]>(this.productUrl, { params }).pipe(delay(2000));
  }

  // ENZO
  getProductos(): Observable<Producto[]> {
    return this.http.get<any[]>(this.historialAmountUrl).pipe(map(data => data.map(item => ({...item,
        date: this.convertirFecha(item.date)  // Convertir a Date usando una función personalizada
      })))
    );
  }

  // ENZO
  private convertirFecha(fechaStr: string): Date {
    const [dia, mes, anio] = fechaStr.split('/').map(Number);  // Divide la fecha y convierte a número
    return new Date(anio, mes - 1, dia);  // Mes es 0-indexed en JavaScript
  }

  // TOMAS C
  createProduct(dto: CreateProductDtoClass, idUser: number): Observable<any> {
    const url = `${this.apiUrl}/product`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('idUser', idUser.toString());
    const json = JSON.stringify(dto);

    console.log(json);

    return this.http.post<any>(url, json, { headers, params });
  }
}
