import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { EmpListadoEmpleados } from '../../models/emp-listado-empleados';
import { EmpListadoAsistencias } from '../../models/emp-listado-asistencias';
import { EmployeePerformance } from '../../models/listado-desempeño';

declare var $: any;
declare var DataTable: any;

@Component({
  selector: 'app-emp-listado-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emp-listado-empleados.component.html',
  styleUrls: ['./emp-listado-empleados.component.css'],
})
export class EmpListadoEmpleadosComponent implements OnInit, OnDestroy {
  Empleados: EmpListadoEmpleados[] = [];
  Asistencias: EmpListadoAsistencias[] = [];
  filteredAsistencias: EmpListadoAsistencias[] = [];
  employeePerformances: EmployeePerformance[] = [];
  private table: any;
  ventana: string = "Informacion";
  router = inject(Router);
  showModal = false;
  modalContent: SafeHtml = '';
  startDate!: string;
  endDate!: string;
  private subscriptions: Subscription[] = [];

  constructor(
    private empleadoService: EmpListadoEmpleadosService,
    private employeePerformanceService: ListadoDesempeñoService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadEmpleados();
    this.initializeDates();
    this.setInitialDates();
  }

  setInitialDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDateInput: HTMLInputElement = document.getElementById(
      'startDate'
    ) as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById(
      'endDate'
    ) as HTMLInputElement;

    startDateInput.value = this.formatDateForInput(thirtyDaysAgo);
    endDateInput.value = this.formatDateForInput(today);

    // Establecer los límites de las fechas
    endDateInput.max = this.formatDateForInput(today);
    startDateInput.max = endDateInput.value;
    endDateInput.min = startDateInput.value;

    // Trigger the filter
    this.filterByDate();
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    if (this.table) {
      this.table.destroy();
    }
  }

  initializeDates(): void {
    const today = new Date();
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 0, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const thirtyDaysAgo = new Date(today);
    this.startDate = this.formatDate(thirtyDaysAgo);
    this.endDate = this.formatDate(today);
  }

  loadEmpleados(): void {
    const empSubscription = this.empleadoService.getEmployees().subscribe({
      next: (empleados) => {
        this.Empleados = empleados;
        this.ventana = 'Informacion';
        this.initializeDataTable();
      },
      error: (err) => console.error('Error al cargar empleados:', err),
    });
    this.subscriptions.push(empSubscription);
  }

  loadAsistencias(): void {
    const asistSubscription = this.empleadoService.getAttendances().subscribe({
      next: (asistencias) => {
        this.Asistencias = asistencias;
        this.filteredAsistencias = asistencias;
        this.ventana = 'Asistencias';
        this.initializeDataTable();
      },
      error: (err) => console.error('Error al cargar asistencias:', err),
    });
    this.subscriptions.push(asistSubscription);
  }

  loadDesempeno(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

  }

  initializeDataTable(): void {
    if (this.table) {
      this.table.destroy();
      $('#empleadosTable').empty();
    }

    const commonConfig = {
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
        zeroRecords: "No se encontraron registros",
        emptyTable: "No hay datos disponibles",
      }
    };

    switch (this.ventana) {
      case 'Informacion':
        this.initializeInformacionTable(commonConfig);
        break;
      case 'Asistencias':
        this.initializeAsistenciasTable(commonConfig);
        break;
      case 'Desempeño':
        this.initializeDesempenoTable(commonConfig);
        break;
    }
  }

  private initializeInformacionTable(commonConfig: any): void {
    this.table = $('#empleadosTable').DataTable({
      ...commonConfig,
      layout: {
        topStart: 'search',
        topEnd: null
      },
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
              <div class="dropdown text-center">
                <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                  style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                  &#8942; <!-- Tres puntos verticales -->
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item consultar-btn" data-empleado-id="${data.id}" href="#">Ver más</a></li>
                  <li><a class="dropdown-item modificar-btn" data-empleado-id="${data.id}" href="#">Modificar</a></li>
                </ul>
              </div>`;
          }
        }
      ]
    });

    $('#empleadosTable').on('click', '.consultar-btn', (event: any) => {
      event.preventDefault();
      const empleadoId = $(event.currentTarget).data('empleado-id');
      this.consultarEmpleado(empleadoId);
    });
  }

  private initializeAsistenciasTable(commonConfig: any): void {
    this.table = $('#empleadosTable').DataTable({
      layout: {
        topStart: 'search',
        topEnd: null
      },
      ...commonConfig,
      data: this.filteredAsistencias,
      columns: [
        { data: 'date', title: 'Fecha' },
        { data: 'employeeName', title: 'Apellido y nombre' },
        { data: 'state', title: 'Estado' },
        { data: 'arrivalTime', title: 'Hora de entrada' },
        { data: 'departureTime', title: 'Hora de salida' }
      ]
    });
  }

  private initializeDesempenoTable(commonConfig: any): void {
    this.table = $('#empleadosTable').DataTable({
      layout: {
        topStart: 'search',
        topEnd: null
      },
      ...commonConfig,
      data: this.employeePerformances,
      columns: [
        {
          data: 'performance',
          title: 'Fecha Inicio',
          render: (data: any[]) => {
            return data.length > 0 ? new Date(data[0].startDate).toLocaleDateString() : 'No hay fechas';
          }
        },
        {
          data: 'performance',
          title: 'Fecha Fin',
          render: (data: any[]) => {
            return data.length > 0 ? new Date(data[0].endDate).toLocaleDateString() : 'No hay fechas';
          }
        },
        { data: 'employee.fullName', title: 'Nombre' },
        { data: 'employee.position', title: 'Cargo' },
        {
          data: 'performance',
          title: 'Desempeño',
          render: (data: any[]) => {
            return data.length > 0 ? data[0].performanceType : 'No hay datos';
          }
        },
        {
          data: 'performance',
          title: 'Observaciones',
          render: (data: any[]) => {
            const filteredData = data.filter(item => {
              const itemDate = new Date(item.startDate);
              const startDate = new Date(this.startDate);
              const endDate = new Date(this.endDate);
              return itemDate >= startDate && itemDate <= endDate;
            });
            return filteredData.length > 0 ? filteredData.length : 'No hay observaciones';
          }
        }
      ]
    });
  }

  consultarEmpleado(id: number): void {
    const empByIdSubscription = this.empleadoService.getEmployeeById(id).subscribe({
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
    this.subscriptions.push(empByIdSubscription);
  }

  onStartDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('endDate') as HTMLInputElement;

    // Establecer límites de fechas
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    endDateInput.max = formattedToday;

    if (startDateInput.value) {
      endDateInput.min = startDateInput.value;
    } else {
      endDateInput.min = '';
    }

    this.filterByDate();
  }

  onEndDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('endDate') as HTMLInputElement;

    if (endDateInput.value) {
      startDateInput.max = endDateInput.value;
    } else {
      startDateInput.max = '';
    }

    this.filterByDate();
  }

  filterByDate(): void {
    const startDateInput: HTMLInputElement = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('endDate') as HTMLInputElement;

    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    if (startDate && endDate && startDate > endDate) {
      //alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      startDateInput.value = '';
      endDateInput.value = '';
      return;
    }
    this.filteredAsistencias = this.Asistencias.filter((producto) => {
      const productDate = new Date(this.formatDateyyyyMMdd(producto.date));
      return (
        (!startDate || productDate >= startDate) &&
        (!endDate || productDate <= endDate)
      );
    });

    // Actualizar el DataTable
    if (this.table) {
      this.table.clear().rows.add(this.filteredAsistencias).draw(); // Actualiza la tabla con los productos filtrados
    }
  }

  onFilterByDate(): void {
    if (this.ventana === 'Desempeño') {
      this.loadDesempeno();
    }
  }

  formatDateyyyyMMdd(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  closeModal(): void {
    this.showModal = false;
  }

  irMenu(): void {
    this.router.navigate(['']);
  }

  navigateToWakeUpCallForm(): void {
    this.router.navigate(['/wake-up-call']);
  }
}