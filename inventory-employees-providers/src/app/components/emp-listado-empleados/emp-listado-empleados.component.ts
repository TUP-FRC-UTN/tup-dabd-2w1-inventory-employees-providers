import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { EmpListadoEmpleados } from '../../interfaces/emp-listado-empleados';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emp-listado-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emp-listado-empleados.component.html',
  styleUrls: ['./emp-listado-empleados.component.css'],
})
export class EmpListadoEmpleadosComponent implements OnInit {
  Empleados: EmpListadoEmpleados[] = [];

  constructor(private empleadoService: EmpListadoEmpleadosService) {}

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.empleadoService.getEmployees().subscribe({
      next: (empleados) => {
        this.Empleados = empleados; // Asignar los empleados al array
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err); // Manejo de errores
      },
    });
  }

  accionSeleccionada(id: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement; // Asegúrate de que `target` es un `HTMLSelectElement`
    const accion = selectElement.value;
  
    if (!accion) {
      console.warn('Acción no seleccionada para el empleado con ID:', id);
      return;
    }
    
    switch (accion) {
      case 'editar':
        this.editarEmpleado(id);
        break;
      case 'eliminar':
        this.eliminarEmpleado(id);
        break;
      default:
        break;
    }
  }
  
  

  editarEmpleado(id: number): void {
    // Implementar la lógica de edición aquí
    console.log('Editar empleado con ID:', id);
  }

  eliminarEmpleado(id: number): void {
    // Implementar la lógica de eliminación aquí
    console.log('Eliminar empleado con ID:', id);
  }
}
