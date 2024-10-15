import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { CommonModule } from '@angular/common';
import $ from 'jquery';
// import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import { EmpListadoEmpleados } from '../../models/emp-listado-empleados';




@Component({
  selector: 'app-emp-listado-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emp-listado-empleados.component.html',
  styleUrls: ['./emp-listado-empleados.component.css'], // Corrige 'styleUrl' a 'styleUrls'
})
export class EmpListadoEmpleadosComponent implements OnInit, OnDestroy {
accionSeleccionada(arg0: number,$event: Event) {
throw new Error('Method not implemented.');
}
  Empleados: EmpListadoEmpleados[] = [];
  private table: any;

  constructor(private empleadoService: EmpListadoEmpleadosService) {}

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.empleadoService.getEmployees().subscribe({
      next: (empleados) => {
        this.Empleados = empleados; // Asignar los empleados al array
        this.initializeDataTable(); // Inicializa DataTable después de cargar los empleados
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err); // Manejo de errores
      },
    });

    setTimeout(() => {
      this.initializeDataTable();
    }, 0);
  }

  

  initializeDataTable(): void {
    if (this.table) {
      this.table.destroy(); // Destruye la instancia existente de DataTables si ya fue inicializada
      $('#empleadosTable').empty(); // Limpia el contenido de la tabla para evitar conflictos
    }
    this.table = $('#empleadosTable').DataTable({
      data: this.Empleados, // Aquí le pasas los datos directamente
      columns: [
        { data: 'fullName', title: 'Apellido y Nombre' },
        { data: 'document', title: 'Documento' },
        { data: 'position', title: 'Posición' },
        { 
          data: 'salary',
          title: 'Salario',
          className: 'text-end', // Clase para alinear a la derecha
          render: (data: number) => {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data);
          }
        },
        {
          data: null,
          title: 'Acciones',
          render: (data: any, type: any, row: any) => {
            return `
              <select class="form-select form-select-sm" onchange="accionSeleccionada('${data.id}', this)">
                <option value="" disabled selected>Seleccionar acción</option>
                <option value="editar">Editar</option>
                <option value="eliminar">Eliminar</option>
              </select>`;
          }
        }
      ],
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
      },
    });
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy(); // Destruir la instancia de DataTable al destruir el componente
    }
  }

  editarEmpleado(id: any): void {
    // Implementar la lógica de edición
  }

  eliminarEmpleado(id: any): void {
    // Implementar la lógica de eliminación
  }
}