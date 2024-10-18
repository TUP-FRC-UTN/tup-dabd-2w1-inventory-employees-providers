import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RequestWakeUpCallDTO,RequestWakeUpCallGroupDTO,ResponseWakeUpCallDTO,EmployeeGetResponseDTO } from '../models/llamado-atencion';

@Injectable({
  providedIn: 'root'
})
export class LlamadoAtencionService {

  private apiUrl = 'http://localhost:8080/wakeUpCalls';
  private apiUrle = 'http://localhost:8080';

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

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de error
      errorMessage = error.error; // Asumimos que el backend envía el mensaje de error directamente
    }
    console.error('Error en LlamadoAtencionService:', errorMessage);
    return throwError(errorMessage);
  }
}
