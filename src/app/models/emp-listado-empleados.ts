export interface EmpListadoEmpleados {
  id: number; // ID del empleado
  fullName: string; // Nombre completo del empleado
  document: string; // Documento de identidad (DNI o PASSPORT)
  position: string; // Cargo del empleado
  salary: number; // Salario del empleado (en formato de texto)
}
