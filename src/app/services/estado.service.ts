import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {

  private readonly EMPLOYEE_BASE_URL: string = 'http://localhost:8080/';

  private readonly ESTADO_URL: string = `${this.EMPLOYEE_BASE_URL}detailProductState/getAll`;  

  constructor(private client: HttpClient) { }

  getEstados():Observable<String[]> {
    return this.client.get<String[]>(`${this.ESTADO_URL}`);
  }
}
