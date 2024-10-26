import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetWarehouseMovementRequest } from '../models/GetWarehouseMovementRequest';
import { WarehouseMovement } from '../models/getWarehouseMovementResponse';
import { Observable } from 'rxjs';
import { IepCreateWarehouseMovementDTO } from '../models/iep-create-warehouse-movement-dto';

@Injectable({
  providedIn: 'root'
})
export class WarehouseMovementService {

  constructor(private http: HttpClient) {}

  public searchMovements(searchParams:GetWarehouseMovementRequest):Observable<WarehouseMovement[]> {
    let params = new HttpParams();
    if (searchParams.createdDate) {
      params = params.append('createdDate', searchParams.createdDate);
    }
    if (searchParams.applicantOrResponsible) {
      params = params.append('applicantOrResponsible', searchParams.applicantOrResponsible);
    }
    if (searchParams.productId) {
      params = params.append('productId', searchParams.productId);
    }
    if (searchParams.movementType) {
      params = params.append('movementType', searchParams.movementType);
    }
    if (searchParams.detailCount) {
      params = params.append('detailCount', searchParams.detailCount);
    }
    return this.http.get<WarehouseMovement[]>('http://localhost:8081/warehouseMovement/search', { params })
     
  }

  public postWarehouseMovement(dto: IepCreateWarehouseMovementDTO,idUser:number):Observable<any> {
    const url = `http://localhost:8081/warehouseMovement`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('idUser', idUser.toString());
    const json = JSON.stringify(dto);
    console.log(json);
    return this.http.post<any>(url, json, { headers, params });
  }

}
