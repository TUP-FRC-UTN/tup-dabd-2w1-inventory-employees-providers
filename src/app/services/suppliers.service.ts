import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  createSupplier(formData: any) {
    return this.http.post('http://localhost:8080/suppliers', formData);
  }

  constructor(private http: HttpClient) {}
  
}
