import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProvidersService {

  private baseUrl:string = 'http://localhost:8080/suppliers';

  constructor(private client:HttpClient) { }

  // getProviders():Observable<any[]>{
  //   return this.client.get<any[]>(this.baseUrl).pipe(delay(2000));
  // }

  getProviders():Observable<any[]>{
    return this.client.get<any[]>(this.baseUrl);
  }

}
