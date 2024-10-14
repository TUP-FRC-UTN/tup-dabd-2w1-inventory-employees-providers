import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PostDecrement } from '../interfaces/details';

@Injectable({
  providedIn: 'root'
})
export class DetailServiceService {

  private readonly BASE_URL = 'http://localhost:8080'; // URL base del servidor
  private _refresh$ = new Subject<void>();
  private id: number = 0;
  urlExcel: string = '';

  constructor(private http: HttpClient) {}

  // Getter para acceder al Subject de refresh
  get refresh$(): Observable<void> {
    return this._refresh$;
  }

  setId(id: number): void {
    this.id = id;
    this.urlExcel = `${this.BASE_URL}/detailProductState/getActiveExcel?productId=${this.id}`;
  }

  // Método para obtener los detalles del producto
  getDetails(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/detailProductState/getActive`, {
      params: new HttpParams().set('productId', this.id.toString())
    });
  }

  // Método para decrementar la cantidad de un producto
  postDecrement(postDecrement: PostDecrement): Observable<any> {
    return this.http.post(`${this.BASE_URL}/amountModification/decrement`, postDecrement)
      .pipe(
        tap(() => {
          this._refresh$.next();
        })
      );
  }

  // Método para obtener el PDF de detalles
  getPdf(): Observable<ArrayBuffer> {
    return this.http.get(`${this.BASE_URL}/detailProductState/getActivePdf`, {
      params: new HttpParams().set('productId', this.id.toString()),
      responseType: 'arraybuffer'
    });
  }

  
  getExcel(): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/detailProductState/getActiveExcel`, {
      params: new HttpParams().set('productId', this.id.toString()),
      responseType: 'blob'
    });
  }
  
}
