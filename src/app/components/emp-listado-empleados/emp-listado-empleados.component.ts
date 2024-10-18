import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { CommonModule } from '@angular/common';
import { EmpListadoEmpleados } from '../../models/emp-listado-empleados';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmpListadoAsistencias } from '../../models/emp-listado-asistencias';
import { data } from 'jquery';

declare var $: any;
declare var DataTable: any;

@Component({
  selector: 'app-emp-listado-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emp-listado-empleados.component.html',
  styleUrls: ['./emp-listado-empleados.component.css'],
})
export class EmpListadoEmpleadosComponent implements OnInit, OnDestroy {
  Empleados: EmpListadoEmpleados[] = [];
  Asistencias: EmpListadoAsistencias[] = [];
  private table: any;
  ventana: string = "Informacion";
  router = inject(Router);
  showModal = false;
  modalContent: SafeHtml = '';

  constructor(
    private empleadoService: EmpListadoEmpleadosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.empleadoService.getEmployees().subscribe({
      next: (empleados) => {
        this.Empleados = empleados;
        this.ventana = 'Informacion';
        this.initializeDataTable();
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err);
      },
    });
  }

  loadAsistencias(): void {
    this.empleadoService.getAttendances().subscribe({
      next: (asistencias) => {
        this.Asistencias = asistencias;
        this.ventana = 'Asistencias';
        this.initializeDataTable();
      },
      error: (err) => {
        console.error('Error al cargar asistencias:', err);
      },
    });
  }

  initializeDataTable(): void {
    if (this.table) {
      this.table.destroy();
      $('#empleadosTable').empty();
    }

    if (this.ventana == "Informacion"){
      this.table = $('#empleadosTable').DataTable({
        data: this.Empleados,
        columns: [
          { data: 'fullName', title: 'Apellido y Nombre' },
          { data: 'document', title: 'Documento' },
          { data: 'position', title: 'Posición' },
          {
            data: 'salary',
            title: 'Salario',
            className: 'text-end',
            render: (data: number) => {
              return new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(data);
            }
          },
          {
            data: null,
            title: 'Acciones',
            render: (data: any) => {
              return `
                <div class="dropdown">
                  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    Seleccionar
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item consultar-btn" data-empleado-id="${data.id}" href="#">Consultar</a></li>
                    <li><a class="dropdown-item modificar-btn" data-empleado-id="${data.id}" href="#">Modificar</a></li>
                  </ul>
                </div>`;
            }
          }
        ],
        pageLength: 10,
        lengthChange: false,
        language: {
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
          },
        },
      });
  
      $('#empleadosTable').on('click', '.consultar-btn', (event: { preventDefault: () => void; currentTarget: any; }) => {
        event.preventDefault();
        const empleadoId = $(event.currentTarget).data('empleado-id');
        this.consultarEmpleado(empleadoId);
      });
    }
    
    if (this.ventana == "Asistencias"){
      this.table = $('#empleadosTable').DataTable({
        data: this.Asistencias,
        columns: [
          { data: 'employeeName', title: 'Apellido y nombre' },
          { data: 'date', title: 'Fecha' },
          { data: 'state', title: 'Estado' },
          { data: 'arrivalTime', title: 'Hora de entrada'},
          { data: 'departureTime', title: 'Hora de salida'}
        ],
        pageLength: 10,
        lengthChange: false,
        language: {
          search: "Buscar:",
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
  }

  consultarEmpleado(id: number): void {
    this.empleadoService.getEmployeeById(id).subscribe({
      next: (empleado) => {
        const fechaContrato = new Date(empleado.contractStartTime[0], 
                                     empleado.contractStartTime[1] - 1, 
                                     empleado.contractStartTime[2])
                                     .toLocaleDateString();
                                     
        const horaInicio = `${empleado.startTime[0]}:${empleado.startTime[1].toString().padStart(2, '0')}`;
        const horaFin = `${empleado.endTime[0]}:${empleado.endTime[1].toString().padStart(2, '0')}`;
        
        const content = `
          <div class="container">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Información Personal</h6>
                <p><strong>Nombre completo:</strong> ${empleado.surname}, ${empleado.name}</p>
                <p><strong>Documento:</strong> ${empleado.documentType} ${empleado.documenValue}</p>
                <p><strong>CUIL:</strong> ${empleado.cuil}</p>
              </div>
              <div class="col-md-6">
                <h6>Información Laboral</h6>
                <p><strong>Cargo:</strong> ${empleado.charge.charge}</p>
                <p><strong>Fecha de contrato:</strong> ${fechaContrato}</p>
                <p><strong>Salario:</strong> $${empleado.salary.toLocaleString()}</p>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Horario</h6>
                <p><strong>Hora entrada:</strong> ${horaInicio}</p>
                <p><strong>Hora salida:</strong> ${horaFin}</p>
              </div>
              <div class="col-md-6">
                <h6>Días laborables</h6>
                <p>
                  ${empleado.mondayWorkday ? '✓ Lunes<br>' : ''}
                  ${empleado.tuesdayWorkday ? '✓ Martes<br>' : ''}
                  ${empleado.wednesdayWorkday ? '✓ Miércoles<br>' : ''}
                  ${empleado.thursdayWorkday ? '✓ Jueves<br>' : ''}
                  ${empleado.fridayWorkday ? '✓ Viernes<br>' : ''}
                  ${empleado.saturdayWorkday ? '✓ Sábado<br>' : ''}
                  ${empleado.sundayWorkday ? '✓ Domingo' : ''}
                </p>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <h6>Información adicional</h6>
                <p><strong>Obra Social:</strong> ${empleado.healthInsurance ? 'Sí' : 'No'}</p>
                <p><strong>Estado:</strong> ${empleado.active ? 'Activo' : 'Inactivo'}</p>
                <p><strong>Licencia:</strong> ${empleado.license ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>
        `;
  
        this.modalContent = this.sanitizer.bypassSecurityTrustHtml(content);
        this.showModal = true;
      },
      error: (error) => {
        console.error('Error al obtener los datos del empleado:', error);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  irMenu(): void {
    this.router.navigate(['']);
  }
}