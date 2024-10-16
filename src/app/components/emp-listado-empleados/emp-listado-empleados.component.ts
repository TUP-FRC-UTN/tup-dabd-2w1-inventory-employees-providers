import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service'; // Servicio para obtener empleados
import { CommonModule } from '@angular/common';
import $ from 'jquery'; // Importación de jQuery
import 'datatables.net'; // Importación de DataTables
import 'datatables.net-dt'; // Estilos para DataTables
import { EmpListadoEmpleados } from '../../models/emp-listado-empleados'; // Modelo de empleado

@Component({
  selector: 'app-emp-listado-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emp-listado-empleados.component.html',
  styleUrls: ['./emp-listado-empleados.component.css'], // Corrige 'styleUrl' a 'styleUrls'
})
export class EmpListadoEmpleadosComponent implements OnInit, OnDestroy {
  // Array que contiene la lista de empleados
  Empleados: EmpListadoEmpleados[] = [];
  private table: any; // Referencia para la instancia de DataTable

  // Inyección del servicio que obtiene los empleados
  constructor(private empleadoService: EmpListadoEmpleadosService) {}

  // Hook de ciclo de vida que se ejecuta cuando el componente es inicializado
  ngOnInit(): void {
    this.loadEmpleados(); // Carga la lista de empleados
  }

  // Método que obtiene la lista de empleados desde el servicio
  loadEmpleados(): void {
    this.empleadoService.getEmployees().subscribe({
      next: (empleados) => {
        this.Empleados = empleados; // Asigna los empleados al array
        this.initializeDataTable(); // Inicializa DataTable después de cargar los empleados
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err); // Manejo de errores
      },
    });

    // Retrasa la inicialización de DataTable para asegurar que los datos estén cargados
    setTimeout(() => {
      this.initializeDataTable();
    }, 0);
  }

  // Método que inicializa o reinicia el DataTable
  initializeDataTable(): void {
    if (this.table) {
      this.table.destroy(); // Destruye la instancia existente de DataTable si ya fue inicializada
      $('#empleadosTable').empty(); // Limpia el contenido de la tabla para evitar conflictos
    }

    // Inicialización de DataTable con la configuración y los datos
    this.table = $('#empleadosTable').DataTable({
      data: this.Empleados, // Pasar los datos de empleados directamente
      columns: [
        { data: 'fullName', title: 'Apellido y Nombre' }, // Columna de nombre completo
        { data: 'document', title: 'Documento' }, // Columna de documento
        { data: 'position', title: 'Posición' }, // Columna de posición
        {
          data: 'salary',
          title: 'Salario',
          className: 'text-end', // Clase para alinear el salario a la derecha
          render: (data: number) => {
            // Formateo de la columna de salario
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data);
          }
        },
        {
          data: null,
          title: 'Acciones',
          render: (data: any) => {
            // Renderiza un dropdown para seleccionar acciones (editar/eliminar)
            return `
              <select class="form-select form-select-sm" onchange="accionSeleccionada('${data.id}', this)">
                <option value="" disabled selected>Seleccionar acción</option>
                <option value="editar">Editar</option>
                <option value="eliminar">Eliminar</option>
              </select>`;
          }
        }
      ],
      pageLength: 10, // Cantidad de registros por página
      lengthMenu: [10, 25, 50, 100], // Opciones de paginación
      language: {
        search: "Buscar:", // Traducción del texto de búsqueda
        lengthMenu: "Mostrar _MENU_ registros", // Traducción del selector de cantidad de registros
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros", // Texto de información
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
      },
    });
  }

  // Hook de ciclo de vida que se ejecuta cuando el componente es destruido
  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy(); // Destruye la instancia de DataTable al destruir el componente
    }
  }

  // Métodos para acciones (se deben implementar)
  
  // Método para editar empleado (implementación pendiente)
  editarEmpleado(id: any): void {
    // Implementar la lógica de edición
  }

  // Método para eliminar empleado (implementación pendiente)
  eliminarEmpleado(id: any): void {
    // Implementar la lógica de eliminación
  }

  // Método que maneja la selección de acción (pendiente de implementación)
  accionSeleccionada(arg0: number, $event: Event): void {
    throw new Error('Method not implemented.');
  }
}
