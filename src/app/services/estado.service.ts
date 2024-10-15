import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {

  estadoUrl = 'http://localhost:8080/detailProductState/getAll'

  constructor(private client: HttpClient) { }

  getEstados():Observable<String[]> {
    return this.client.get<String[]>(`${this.estadoUrl}`);
  }
}
