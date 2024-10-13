import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs'; // Importa Observable y Subject de RxJS para manejar la programación reactiva
import { tap } from 'rxjs/operators'; // Importa el operador tap para realizar acciones secundarias
import { PostDecrement } from '../interfaces/details';

@Injectable({
  providedIn: 'root'
})
export class DetailServiceService {

  private _refresh$ = new Subject<void>();
  public id = 0;

  constructor(private http: HttpClient) { }

  // Getter para acceder al Subject de refresh
  get refresh$() {
    return this._refresh$;
  }

  setId(id: number){
    this.id = id;
  }

  // Método para obtener los detalles del producto
  getDetails(): Observable<any> {
    let id = this.id.toString();
    return this.http.get(`http://localhost:8080/detailProductState/getActive?productId=` + id);
    // Realiza una solicitud GET a la API para obtener los detalles de un producto activo
  }

  // Método para decrementar la cantidad de un producto
  postDecrement(postDecrement: PostDecrement): Observable<any> {
    return this.http.post('http://localhost:8080/amountModification/decrement', postDecrement)
      .pipe(
        // Usa el operador tap para ejecutar una acción después de la llamada HTTP
        tap(() => {
          // Notifica a los suscriptores que se ha producido un cambio
          this._refresh$.next();
        })
      )
  }

  getPdf(): Observable<ArrayBuffer> {
    let id = this.id.toString();
    return this.http.get('http://localhost:8080/detailProductState/getActivePdf?productId=' + id, {
      responseType: 'arraybuffer'
    });
  }
}
