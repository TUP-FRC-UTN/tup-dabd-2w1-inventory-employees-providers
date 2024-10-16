import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestWakeUpCallDTO,RequestWakeUpCallGroupDTO,ResponseWakeUpCallDTO,EmployeeGetResponseDTO } from '../models/llamado-atencion';

@Injectable({
  providedIn: 'root'
})
export class LlamadoAtencionService {

  private apiUrl = 'http://localhost:8080/wakeUpCalls'; // URL del backend
  private apiUrle = 'http://localhost:8080'; // URL base del backend

  constructor(private http: HttpClient) {}

  // Crear WakeUpCall para un solo empleado
  crearWakeUpCall(request: RequestWakeUpCallDTO): Observable<ResponseWakeUpCallDTO> {
    return this.http.post<ResponseWakeUpCallDTO>(`${this.apiUrl}/crear`, request);
  }

  // Crear WakeUpCall para un grupo de empleados
  crearWakeUpCallGrupo(request: RequestWakeUpCallGroupDTO): Observable<ResponseWakeUpCallDTO[]> {
    return this.http.post<ResponseWakeUpCallDTO[]>(`${this.apiUrl}/crear/grupo`, request);
  }

  // Obtener todos los empleados
  getAllEmployees(): Observable<EmployeeGetResponseDTO[]> {
    return this.http.get<EmployeeGetResponseDTO[]>(`${this.apiUrle}/employees/allEmployees`);
  }
}
