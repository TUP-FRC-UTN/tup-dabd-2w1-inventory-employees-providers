import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RequestWakeUpCallDTO,RequestWakeUpCallGroupDTO,ResponseWakeUpCallDTO,EmployeeGetResponseDTO } from '../models/llamado-atencion';
import { MovementRecord } from '../models/llamado-atencion';

@Injectable({
  providedIn: 'root'
})
export class LlamadoAtencionService {

  private apiUrl = 'http://localhost:8080/wakeUpCalls';
  private apiUrle = 'http://localhost:8080';
  private movementsUrl = 'https://mocki.io/v1/dc644c6b-deab-431a-83d9-3d232a1dff05';

  constructor(private http: HttpClient) {}

  crearWakeUpCall(request: RequestWakeUpCallDTO): Observable<ResponseWakeUpCallDTO> {
    return this.http.post<ResponseWakeUpCallDTO>(`${this.apiUrl}/crear`, request)
      .pipe(catchError(this.handleError));
  }

  crearWakeUpCallGrupo(request: RequestWakeUpCallGroupDTO): Observable<ResponseWakeUpCallDTO[]> {
    return this.http.post<ResponseWakeUpCallDTO[]>(`${this.apiUrl}/crear/grupo`, request)
      .pipe(catchError(this.handleError));
  }

  getAllEmployees(): Observable<EmployeeGetResponseDTO[]> {
    return this.http.get<EmployeeGetResponseDTO[]>(`${this.apiUrle}/employees/allEmployees`)
      .pipe(catchError(this.handleError));
  }

  getMovements(date: string): Observable<string[]> {
    return this.http.get<MovementRecord[]>(this.movementsUrl).pipe(
      map(movements => {
        const selectedDate = date.split('T')[0];
        const filteredMovements = movements.filter(movement =>
          movement.movementDatetime.startsWith(selectedDate)
        );
  
        const employeeMovements = new Map<string, string[]>();
        filteredMovements.forEach(movement => {
          const employeeTypes = employeeMovements.get(movement.document) || [];
          employeeTypes.push(movement.movementType);
          employeeMovements.set(movement.document, employeeTypes);
        });
  
        return Array.from(employeeMovements.entries())
          .filter(([_, types]) =>
            types.includes('ENTRADA') && types.includes('SALIDA')
          )
          .map(([document]) => document);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error;
    }
    console.error('Error en LlamadoAtencionService:', errorMessage);
    return throwError(errorMessage);
  }
}
