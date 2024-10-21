import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EmpListadoEmpleados, Employee } from '../models/emp-listado-empleados';
import { EmpListadoAsistencias } from '../models/emp-listado-asistencias';

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

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(
      `${this.BASE_URL}/employees/employeeById?id=${id}`
    );
  }

  getAttendances(): Observable<EmpListadoAsistencias[]> {
    return this.http.get<EmpListadoAsistencias[]>(
      `${this.BASE_URL}/attendances/get`
    );
  }

  putAttendances(id: number, state: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('id', id);
    params = params.set('state', state);
    console.log("Id: " + id + " State: " + state)
    return this.http.put(`${this.BASE_URL}/attendances/put`, null, {params});
  }
}