import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetWarehouseMovementRequest } from '../models/GetWarehouseMovementRequest';
import { WarehouseMovement } from '../models/getWarehouseMovementResponse';
import { Observable } from 'rxjs';
import { IepCreateWarehouseMovementDTO } from '../models/iep-create-warehouse-movement-dto';
import { CreateMovementDTO, MovementDTO } from '../models/WarehouseMovementByProduct';
@Injectable({
  providedIn: 'root',
})
export class WarehouseMovementService {
  private apiUrl = 'http://localhost:8081/movements'; // Cambia esta URL a la del backend

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los movimientos
   */
  findAll(): Observable<MovementDTO[]> {
    return this.http.get<MovementDTO[]>(this.apiUrl);
  }

  /**
   * Obtiene un movimiento por su ID
   * @param id El ID del movimiento
   */
  findById(id: number): Observable<MovementDTO> {
    return this.http.get<MovementDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo movimiento
   * @param movementData Los datos del nuevo movimiento
   */
  create(movementData: CreateMovementDTO): Observable<MovementDTO> {
    return this.http.post<MovementDTO>(this.apiUrl, movementData);
  }
}