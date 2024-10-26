import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Supplier } from '../models/suppliers';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  createSupplier(formData: any) {
    return this.http.post('http://localhost:8081/suppliers', formData);
  }
  searchSuppliers(
    name: string | null, 
    supplierType: string | null, 
    createdDatetime: string | null,
    authorized:boolean
  ): Observable<Supplier[]> {
    let params = new HttpParams();

    if (authorized) {
      params = params.set('authorized', authorized.toString());
    }
    if (name) {
      params = params.set('name', name);
    }

    if (supplierType) {
      params = params.set('supplierType', supplierType);
    }

    if (createdDatetime) {
      params = params.set('dateOfJoining', createdDatetime);
    }
   
    return this.http.get<Supplier[]>(`http://localhost:8081/suppliers`, { params });
  }


  getSupplierById(id:number):Observable<any>{
    return this.http.get<any>('http://localhost:8081/suppliers'+"/"+id)
  }


  updateSupplier(id:number,supplierUpdate:any):Observable<any>{
    return this.http.put<any>(`http://localhost:8081/suppliers/${id}`,supplierUpdate)
  }

  deleteSupplier(id: number): Observable<any> {
    return this.http.put<any>(`http://localhost:8081/suppliers/bajalogica/${id}`, {});
}


  constructor(private http: HttpClient) {}
  
}
