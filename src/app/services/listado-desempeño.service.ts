import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Employee, WakeUpCall, EmployeePerformance } from '../models/listado-desempeño';

@Injectable({
  providedIn: 'root'
})
export class ListadoDesempeñoService {

  private employeesUrl = 'http://localhost:8080/employees/allEmployees';
  private wakeUpCallsUrl = 'http://localhost:8080/wakeUpCalls/todas';

  constructor(private http: HttpClient) {}

  getEmployeesPerformanceByDateRange(startDate: Date, endDate: Date): Observable<EmployeePerformance[]> {
    return forkJoin({
      employees: this.http.get<Employee[]>(this.employeesUrl),
      wakeUpCalls: this.http.get<WakeUpCall[]>(this.wakeUpCallsUrl)
    }).pipe(
      map(response => {
        const employees = response.employees;
        const wakeUpCalls = response.wakeUpCalls;

        // Filtrar los wake-up calls según el rango de fechas
        const filteredWakeUpCalls = wakeUpCalls.filter(wuc => {
          const wucStartDate = new Date(wuc.startDate);
          const wucEndDate = new Date(wuc.endDate);

          return (wucStartDate >= startDate && wucStartDate <= endDate) ||
                 (wucEndDate >= startDate && wucEndDate <= endDate);
        });

        // Contar observaciones y mapear empleados con su desempeño en el rango de fechas
        return employees.map(employee => {
          const employeeWakeUpCalls = filteredWakeUpCalls.filter(wuc => wuc.employeeId === employee.id);
          const observationsCount = employeeWakeUpCalls.length; // Contar las observaciones

          return {
            employee,
            performance: employeeWakeUpCalls
          };
        });
      })
    );
  }
}
