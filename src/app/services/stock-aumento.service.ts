import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockAumento } from '../models/stock-aumento';
import { Supplier } from '../models/suppliers';

@Injectable({
  providedIn: 'root'
})
export class StockAumentoService {

  private apiUrl = 'http://localhost:8081/amountModification/modify-stock'; // TOMAS
  private suppliersUrl = 'http://localhost:8081/suppliers'; // Ruta para obtener proveedores  //TOMAS
  private productsUrl = 'http://localhost:8081/product/getAll'; // URL de los productos //SANTI

  idProduct: number = 0;
  constructor(private http: HttpClient) {}

  // Método para modificar stock  // TOMAS
  modifyStock(stockData: StockAumento): Observable<string> {
    return this.http.post(this.apiUrl, stockData, { responseType: 'text' });
  }
  
  // Método para obtener proveedores // TOMAS
  getSuppliers(): Observable<Supplier[]> { // Nuevo método para obtener proveedores
    return this.http.get<Supplier[]>(this.suppliersUrl);
  }

   // Método para obtener todos los productos // SANTI
   getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.productsUrl);
  }

  // Método para obtener un producto específico por su ID // SANTI
  getProductById(): Observable<any> {
    return this.http.get<any>(`${this.productsUrl}?id=${this.idProduct}`);
  }

  setId(id: number){
    this.idProduct = id;
  }

  getId(){
    return this.idProduct;
  }

  }
