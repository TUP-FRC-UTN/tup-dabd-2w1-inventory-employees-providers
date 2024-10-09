import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../interfaces/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'https://mocki.io/v1/be34da7e-df7a-4bfe-b7f5-afef612a460e';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => data.map(item => ({
        ...item,
        fecha: this.convertirFecha(item.fecha)  // Convertir a Date usando una función personalizada
      })))
    );
  }

  private convertirFecha(fechaStr: string): Date {
    const [dia, mes, anio] = fechaStr.split('/').map(Number);  // Divide la fecha y convierte a número
    return new Date(anio, mes - 1, dia);  // Mes es 0-indexed en JavaScript
  }
}
