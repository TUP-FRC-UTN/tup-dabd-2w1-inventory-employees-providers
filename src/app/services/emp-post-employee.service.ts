import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Provincia } from '../models/emp-provincia';

@Injectable({
  providedIn: 'root'
})
export class EmpPostEmployeeService {

  private baseUrlSupplier:string = 'http://localhost:8080/suppliers';

  private baseUrlProvinces:string ='https://mocki.io/v1/555e5ed8-37c8-480b-8452-7affe6f6f833';
  constructor(private client:HttpClient) { }

  private _refresh$= new Subject<void>();

  get refresh$():Observable<void>{return this._refresh$;}
  // getProviders():Observable<any[]>{
  //   return this.client.get<any[]>(this.baseUrl).pipe(delay(2000));
  // }

  getProviders():Observable<any[]>{
    return this.client.get<any[]>(this.baseUrlSupplier);
  }

  getProvinces():Observable<Provincia[]>{
    return this.client.get<Provincia[]>(this.baseUrlProvinces);
  }



}
