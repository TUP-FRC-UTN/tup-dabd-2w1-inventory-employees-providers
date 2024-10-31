import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Provincia } from '../models/emp-provincia';
import { Charge, PostEmployeeDto } from '../models/emp-post-employee-dto';
import { EmpPutEmployees } from '../models/emp-put-employees';

@Injectable({
  providedIn: 'root',
})
export class EmpPostEmployeeService {
  private readonly EMPLOYEE_BASE_URL: string = 'http://localhost:8080/';
  private readonly INVENTORY_URL: string = 'http://localhost:8081/';

  private SUPPLIER_URL: string = `${this.INVENTORY_URL}suppliers`;

  private readonly CHARGES_URL: string = `${this.EMPLOYEE_BASE_URL}charges`;
  private readonly EMPLOYEE_URL: string = `${this.EMPLOYEE_BASE_URL}employees`;
  private readonly EMPLOYEE_POST_URL: string = `${this.EMPLOYEE_URL}/post`;

  private baseUrlProvinces: string =
    'https://mocki.io/v1/555e5ed8-37c8-480b-8452-7affe6f6f833';

  constructor(private client: HttpClient) { }

  private _refresh$ = new Subject<void>();

  get refresh$(): Observable<void> {
    return this._refresh$;
  }
  // getProviders():Observable<any[]>{
  //   return this.client.get<any[]>(this.baseUrl).pipe(delay(2000));
  // }

  getProviders(): Observable<any[]> {
    return this.client.get<any[]>(this.SUPPLIER_URL);
  }

  getProvinces(): Observable<Provincia[]> {
    return this.client.get<Provincia[]>(this.baseUrlProvinces);
  }

  getCharges(): Observable<Charge[]> {
    return this.client.get<Charge[]>(this.CHARGES_URL);
  }

  createProduct(dto: PostEmployeeDto): Observable<any> {
    const url = `${this.EMPLOYEE_POST_URL}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const json = JSON.stringify(dto);

    console.log(json);

    return this.client.post<any>(url, json, { headers });
  }

  updateEmployee(dto: EmpPutEmployees): Observable<any> {
    const url = `${this.EMPLOYEE_URL}/put/${dto.id}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const json = JSON.stringify(dto);

    return this.client.put<any>(url, json, { headers });
  }
}
