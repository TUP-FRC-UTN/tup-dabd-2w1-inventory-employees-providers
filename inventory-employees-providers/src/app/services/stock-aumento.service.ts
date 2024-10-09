import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockAumento } from '../interfaces/stock-aumento';
import { Supplier } from '../interfaces/suppliers';

@Injectable({
  providedIn: 'root'
})
export class StockAumentoService {

  private apiUrl = 'http://localhost:8080/AmountModification/modify-stock';
  private suppliersUrl = 'http://localhost:8080/suppliers'; // Ruta para obtener proveedores

  constructor(private http: HttpClient) {}

  modifyStock(stockData: StockAumento): Observable<string> {
    return this.http.post(this.apiUrl, stockData, { responseType: 'text' });
  }

  getSuppliers(): Observable<Supplier[]> { // Nuevo método para obtener proveedores
    return this.http.get<Supplier[]>(this.suppliersUrl);
  }
  }
