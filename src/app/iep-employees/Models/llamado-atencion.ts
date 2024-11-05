export interface RequestWakeUpCallDTO {
  empleadoId: number;
  fecha: string; // Usamos string para fechas por simplicidad
  desempeno: 'Leve' | 'Moderado' | 'Severo'; // Enum equivalente
  observation: string;
  lastUpdateUser: number;
  created_user: number;
}

export interface RequestWakeUpCallGroupDTO {
  empleadoIds: number[];
  fecha: string;
  desempeno: 'Leve' | 'Moderado' | 'Severo';
  observation: string;
  lastUpdateUser: number;
  created_user: number;
}

export interface ResponseWakeUpCallDTO {
  empleadoId: number;
  fecha: string;
  desempeno: string;
  observation: string;
  lastUpdateUser: number;
  created_user: number;
}

export interface EmployeeGetResponseDTO {
  id: number;
  fullName: string;
  document: string;
  position: string;
  salary: number;
}

export interface MovementRecord {
  movementType: string;
  movementDatetime: string;
  vehiclesId: number | null;
  document: string;
  typeUser: string;
}
