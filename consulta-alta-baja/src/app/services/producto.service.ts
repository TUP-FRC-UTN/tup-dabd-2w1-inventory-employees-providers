import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../interfaces/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  //private apiUrl = 'https://mocki.io/v1/3d5d8476-ac39-4b45-ae81-22e3e4d19a73';
  private apiUrl = 'http://localhost:8080/AmountModification/getAllModifications';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => data.map(item => ({
        ...item,
        date: this.convertirFecha(item.date) 
      })))
    );
  }

  private convertirFecha(fechaStr: string): Date {
    const [dia, mes, anio] = fechaStr.split('/').map(Number); 
    return new Date(anio, mes - 1, dia); 
  }
}
