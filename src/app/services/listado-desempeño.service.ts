import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Employee, EmployeePerformance, Performance } from '../models/listado-desempeño';

@Injectable({
  providedIn: 'root'
})
export class ListadoDesempeñoService {

  private employeesUrl = 'http://localhost:8080/employees/allEmployees';
  private wakeUpCallsUrl = 'http://localhost:8080/wakeUpCalls/todas';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.employeesUrl);
  }

  getPerformances(): Observable<Performance[]> {
    return this.http.get<Performance[]>(this.wakeUpCallsUrl);
  }

  getCombinedData(): Observable<EmployeePerformance[]> {
    return forkJoin({
      employees: this.getEmployees(),
      performances: this.getPerformances()
    }).pipe(
      map(({ employees, performances }) => {
        return performances.map(performance => {
          const employee = employees.find(emp => emp.id === performance.employeeId);
          return {
            id: performance.employeeId,
            fullName: employee ? employee.fullName : 'Unknown',
            year: performance.year,
            month: performance.month,
            totalObservations: performance.totalWakeUpCalls,
            performanceType: performance.performanceType
          };
        });
      })
    );
  }
}
