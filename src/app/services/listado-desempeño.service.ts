import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, BehaviorSubject, tap } from 'rxjs';
import { Employee, EmployeePerformance, Performance, WakeUpCallDetail } from '../models/listado-desempeño';


@Injectable({
  providedIn: 'root'
})
export class ListadoDesempeñoService {

  private employeesUrl = 'http://localhost:8080/employees/allEmployees';
  private wakeUpCallsUrl = 'http://localhost:8080/wakeUpCalls/todas';
  private wakeUpCallsDetailsUrl = 'http://localhost:8080/wakeUpCalls/AllWakeUpCalls';

  private performancesSubject = new BehaviorSubject<EmployeePerformance[]>([]);
  performances$ = this.performancesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.employeesUrl);
  }

  getPerformances(): Observable<Performance[]> {
    return this.http.get<Performance[]>(this.wakeUpCallsUrl);
  }

  getWakeUpCallDetails(): Observable<WakeUpCallDetail[]> {
    return this.http.get<WakeUpCallDetail[]>(this.wakeUpCallsDetailsUrl);
  }

  getCombinedData(): Observable<EmployeePerformance[]> {
    return forkJoin({
      employees: this.getEmployees(),
      performances: this.getPerformances()
    }).pipe(
      map(({ employees, performances }) => {
        return performances.map(performance => ({
          id: performance.employeeId,
          fullName: employees.find(emp => emp.id === performance.employeeId)?.fullName || 'Unknown',
          year: performance.year,
          month: performance.month,
          totalObservations: performance.totalWakeUpCalls,
          performanceType: performance.performanceType
        }));
      }),
      tap(data => this.performancesSubject.next(data))
    );
  }

  refreshData(): void {
    console.log('Refrescando datos de desempeño...');
    this.getCombinedData().subscribe();
  }
}

