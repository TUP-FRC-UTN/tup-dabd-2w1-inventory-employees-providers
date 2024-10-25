import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service'; // Servicio para obtener empleados
import { CommonModule } from '@angular/common';
import $ from 'jquery'; // Importación de jQuery
import 'datatables.net'; // Importación de DataTables
import 'datatables.net-dt'; // Estilos para DataTables
import { EmpListadoEmpleados } from '../../models/emp-listado-empleados'; // Modelo de empleado
import { Router } from '@angular/router';

@Component({
  selector: 'app-emp-listado-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emp-listado-empleados.component.html',
  styleUrls: ['./emp-listado-empleados.component.css'], // Corrige 'styleUrl' a 'styleUrls'
})
export class EmpListadoEmpleadosComponent implements OnInit, OnDestroy {
  Empleados: EmpListadoEmpleados[] = [];  // Array que contiene la lista de empleados
  private table: any; // Referencia para la instancia de DataTable
  ventana: string = "Informacion";  // Texto para referenciar en que tipo de datos de empleados estamos ubicados
  router = inject(Router);  // Variable para realizar routing

  // Inyección del servicio que obtiene los empleados
  constructor(private empleadoService: EmpListadoEmpleadosService) {}

  // Hook de ciclo de vida que se ejecuta cuando el componente es inicializado
  ngOnInit(): void {
    this.loadEmpleados(); // Carga la lista de empleados
    this.bindEditButtons();
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
              <div class="btn-group dropend">
                <button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">...</button>
                  <ul class="dropdown-menu">
                    <li>
                      <button class="dropdown-item btn btn-secondary" 
                      data-bs-toggle="modal" data-bs-target="#myModal">Consultar
                      </button>
                    </li>
                    <li><button class="dropdown-item btn btn-primary edit-button" data-id="${data.id}">Modificar</button></li>
                  </ul>
              </div> 
              
               <div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h1 class="modal-title fs-5" id="exampleModalLabel">Datos del empleado</h1>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      Id: ${data.id} 
                      <hr>
                      Nombre: ${data.fullName} 
                      <hr>
                      Doc: ${data.document} 
                      <hr>
                      Posicion: ${data.position} 
                      <hr>
                      Salario: ${data.salary} 
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }
        }
      ],
      pageLength: 10, // Cantidad de registros por página
      lengthChange: false,  // Deshabilitado la funcion para cambiar la longitud de una pagina
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
  
  // Método para editar empleado
  editarEmpleado(id: any): void {
    this.router.navigate(['/empleados/modificar', id]);
  }
  bindEditButtons(): void {
    const self = this; // Guardamos el contexto del componente
    $('#empleadosTable').on('click', '.edit-button', function () {
        const id = $(this).data('id'); // Obtenemos el ID del atributo data-id
        self.editarEmpleado(id); // Llama al método editarEmpleado
    });
}

  // Método para eliminar empleado (implementación pendiente)
  eliminarEmpleado(id: any): void {
    // Implementar la lógica de eliminación
  }

  // Método que maneja la selección de acción (pendiente de implementación)
  accionSeleccionada(arg0: number, $event: Event): void {
    throw new Error('Method not implemented.');
  }

  irMenu(){
    this.router.navigate(['']);
  }
}
