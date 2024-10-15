import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EmpListadoEmpleados } from '../interfaces/emp-listado-empleados';

@Injectable({
  providedIn: 'root',
})
export class EmpListadoEmpleadosService {
  private readonly BASE_URL = 'http://localhost:8080'; // URL base del servidor
  private _refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  // Getter para acceder al Subject de refresh
  get refresh$(): Observable<void> {
    return this._refresh$;
  }

  // Método para obtener los empleados.
  getEmployees(): Observable<EmpListadoEmpleados[]> {
    return this.http.get<EmpListadoEmpleados[]>(
      `${this.BASE_URL}/employees/allEmployees`
    );
  }
}
