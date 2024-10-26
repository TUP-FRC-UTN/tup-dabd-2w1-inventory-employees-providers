import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChargeResponse } from '../models/charge-response';
import { ChargeRequest } from '../models/charge-request';

@Injectable({
  providedIn: 'root'
})
export class ChargeService {

  private apiUrl = 'http://localhost:8080/charges';

  constructor(private http: HttpClient) { }

  createCargo(cargoData: ChargeRequest): Observable<ChargeResponse> {
    return this.http.post<ChargeResponse>(`${this.apiUrl}`, cargoData);
  }

  updateCargo(id: number, cargoData: ChargeRequest): Observable<ChargeResponse> {
    return this.http.put<ChargeResponse>(`${this.apiUrl}/${id}`, cargoData);
  }

  getCargo(id: number): Observable<ChargeResponse> {
    return this.http.get<ChargeResponse>(`${this.apiUrl}/${id}`);
  }

  getAllCargos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active`);
  }

  updateStatus(id: number): Observable<ChargeResponse> {
    return this.http.put<ChargeResponse>(`${this.apiUrl}/status/${id}`, null);
  }
}
