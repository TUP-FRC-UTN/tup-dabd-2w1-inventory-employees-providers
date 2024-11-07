import { Component, inject, OnInit } from '@angular/core';
import { EmpListadoAsistencias } from '../../Models/emp-listado-asistencias';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare var $: any;
declare var DataTable: any;

@Component({
  selector: 'app-iep-attendances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iep-attendances.component.html',
  styleUrl: './iep-attendances.component.css'
})
export class IepAttendancesComponent implements OnInit{

  Asistencias: EmpListadoAsistencias[] = [];
  filteredAsistencias: EmpListadoAsistencias[] = [];
  private table: any;
  router = inject(Router);
  empleadoId: number = 0;
  empleadoName: string = "";

  startDate!: string;
  endDate!: string;
  estadoFiltrado: string = "";


  constructor(
    private empleadoService: EmpListadoEmpleadosService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    const name = Number(this.route.snapshot.paramMap.get('id'));  // Esto devuelve un string
    if (name) { this.empleadoId = name;}  // Guardamos el string
    this.loadAsistencias();
    this.initializeDates();
    this.setInitialDates();
  }

  initializeDates(): void {
    const today = new Date();
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 0, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.startDate = this.formatDate(thirtyDaysAgo);
    this.endDate = this.formatDate(today);
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
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadAsistencias(): void {
    const asistSubscription = this.empleadoService.getAttendances().subscribe({
      next: (asistencias) => {
        this.Asistencias = asistencias;
        this.filteredAsistencias = asistencias;
        this.filtrar();
        this.initializeAsistenciasTable();
      },
      error: (err) => console.error('Error al cargar asistencias:', err),
    });
  }

  private initializeAsistenciasTable(): void {

    if (this.table) {
      this.table.destroy();
      $('#empleadosTable').empty();
    }

    this.table = $('#empleadosTable').DataTable({
      pageLength: 5,
      lengthChange: true,
      searching: false,
      language: {
        search: "Buscar:",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        lengthMenu:
          `<select class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        zeroRecords: "No se encontraron registros",
        emptyTable: "No hay datos disponibles",
      },
      dom:
        '<"mb-3"t>' +                           //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
      order: [[0, 'desc']], // Ordenar por fecha de forma descendente
      data: this.filteredAsistencias,
      columns: [
        { data: 'date', title: 'Fecha' },
        {
          data: 'state', title: 'Estado', className: 'text-center',
          render: (data: any) => {
            let color;
            let name;

            switch (data) {
              case "PRESENTE": color = "#28a745"; name = "Presente"; break;
              case "AUSENTE": color = "#dc3545"; name = "Ausente"; break;
              case "JUSTIFICADO": color = "#6f42c1"; name = "Justificado"; break;
              case "TARDE": color = "#ffc107"; name = "Tarde"; break;
            }
            return `<button class="btn border rounded-pill" 
            style="background-color: ${color}; color: white;">${name}</button>`;
          }
        },
        {
          data: 'arrivalTime', title: 'Hora de entrada',
          render: (data: any, type: any, row: any, meta: any) => {
            return row.arrivalTime === null ? "--:--:--" : `${row.arrivalTime}`
          }
        },
        {
          data: 'departureTime', title: 'Hora de salida',
          render: (data: any, type: any, row: any, meta: any) => {
            return row.departureTime === null ? "--:--:--" : `${row.departureTime}`
          }
        },
        {
          data: null,
          title: 'Acciones',
          className: 'text-center',
          render: (data: any, type: any, row: any, meta: any) => {
            const isHidden = row.state === "PRESENTE" || row.state === "TARDE" ? 'style="display: none;"' : '';
  
            // Lógica para los estados AUSENTE y JUSTIFICADO
            let dropdown = '';   
            if (row.state === "AUSENTE") {
              dropdown = `
                <div class="dropdown">
                  <a class="btn btn-light" href="#" role="button" 
                  ${isHidden} data-bs-toggle="dropdown" aria-expanded="false"
                  style="width: 40px; height: 40px; display: flex; justify-content: center; 
                  align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;"> &#8942;
                  </a>
                  <ul class="dropdown-menu">
                    <li><button class="dropdown-item btn-cambiar-estado" data-id="${row.id}" data-nuevoestado="JUSTIFICADO">Justificar</button></li>
                  </ul>
                </div>`;
            } else if (row.state === "JUSTIFICADO") {
              dropdown = `
                <div class="dropdown">
                  <a class="btn btn-light" href="#" role="button" 
                  ${isHidden} data-bs-toggle="dropdown" aria-expanded="false"
                  style="width: 40px; height: 40px; display: flex; justify-content: center; 
                  align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;"> &#8942;
                  </a>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#infoModal" 
                    data-nuevoestado="JUSTIFICADO">Ver Justificación</a></li>
                    <li class="dropdown-divider"></li>
                    <li><button class="dropdown-item btn-cambiar-estado" data-id="${row.id}" data-nuevoestado="AUSENTE">Injustificar</button></li>
                  </ul>
                </div>`;
              }

            // Si el estado es PRESENTE o TARDE, no mostramos el dropdown
            const indicator = row.state === "PRESENTE" || row.state === "TARDE" ? '' : dropdown;

            return indicator;
          },
        }
      ],
    });

    $('#empleadosTable').off('click', 'button').on('click', '.btn-cambiar-estado', (event: any) => {
      const button = $(event.currentTarget);
      const id = button.data('id');
      const nuevoEstado = button.data('nuevoestado');

      // Deshabilitar el botón para evitar múltiples clics
      button.prop('disabled', true);

      if (id && nuevoEstado) {
        this.empleadoService.putAttendances(id, nuevoEstado).subscribe({
          next: (response) => {
            console.log('Asistencia actualizada:', response);
            this.loadAsistencias();
          },
          error: (error) => {
            console.error('Error al actualizar asistencia:', error);
          },
          complete: () => {
            // Habilitar el botón nuevamente si es necesario
            button.prop('disabled', false);
          }
        });
      } else {
        // Habilitar el botón nuevamente si no hay id o nuevoEstado
        button.prop('disabled', false);
      }
    });
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

    this.loadAsistencias();
  }

  onEndDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('endDate') as HTMLInputElement;

    if (endDateInput.value) {
      startDateInput.max = endDateInput.value;
    } else {
      startDateInput.max = '';
    }

    this.loadAsistencias();
  }

  filtrar(): void {

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
    
    if (this.estadoFiltrado !== "") {
      this.filteredAsistencias = this.filteredAsistencias.filter((asistencia) => {
        return asistencia.state === this.estadoFiltrado;
      })
    }

    this.filteredAsistencias = this.filteredAsistencias.filter((asistencia) => {
      return asistencia.employeeId === this.empleadoId;
    })

    const asistencia = this.Asistencias.find(asistencia => asistencia.employeeId === this.empleadoId);
    if (asistencia) { this.empleadoName = asistencia.employeeName; }
  }
  
  formatDateyyyyMMdd(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }
  
  limpiarFiltro() {
    this.estadoFiltrado = "";
    this.setInitialDates();
    this.loadAsistencias();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDate2(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  exportToExcel(): void {
    const encabezado = [
      ['Listado de Asistencias'],
      [], // Fila en blanco
      ['Nombre del Empleado', 'Fecha', 'Hora de Llegada', 'Hora de Salida', 'Estado'] 
    ];

    // Filtra las asistencias del empleado que estás visualizando
    const filteredAsistencias = this.Asistencias.filter(
      asistencia => asistencia.employeeName === this.empleadoName
    );

    // Verifica si existen asistencias para el empleado seleccionado
    if (filteredAsistencias.length === 0) {
      console.error(`No hay datos de asistencia para el empleado ${this.empleadoName}`);
      return;
    }

    // Extrae los datos de las asistencias filtradas como arreglos de arreglos
    const dataToExport = filteredAsistencias.map((asistencia) => [
      asistencia.employeeName,
      asistencia.date,
      asistencia.arrivalTime,
      asistencia.departureTime,
      asistencia.state,
    ]);

    // Crea una hoja de cálculo (worksheet)
    const worksheetData = [...encabezado, ...dataToExport];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Crea un libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Asistencias');

    // Descarga el archivo Excel
    XLSX.writeFile(workbook, `${this.getFormattedDate()}_Lista_Asistencias_${this.empleadoName}.xlsx`);
}


  exportToPdf(): void {
    console.log('Exportando a PDF...');
    const doc = new jsPDF();
  
    // Verifica si hay datos en Asistencias
    if (!this.Asistencias || this.Asistencias.length === 0) {
      console.error('No hay datos de asistencias');
      return;
    }
  
    // Filtra las asistencias del empleado que estás visualizando
    const filteredAsistencias = this.Asistencias.filter(
      asistencia => asistencia.employeeName === this.empleadoName
    );
  
    // Verifica si existen asistencias para el empleado seleccionado
    if (filteredAsistencias.length === 0) {
      console.error(`No hay datos de asistencia para el empleado ${this.empleadoName}`);
      return;
    }
  
    const dataToExport = filteredAsistencias.map((asistencia) => [
      asistencia.date,
      asistencia.employeeName,
      asistencia.state,
      asistencia.arrivalTime,
      asistencia.departureTime,
      asistencia.justification
    ]);
  

  
    doc.setFontSize(16);
    doc.text(`Lista de Asistencias de ${this.empleadoName}`, 10, 10);
  
    // Agrega las fechas al PDF
    doc.setFontSize(12);
  
    (doc as any).autoTable({
      head: [['Fecha', 'Apellido y nombre', 'Estado', 'Hora de entrada', 'Hora de salida', 'Observaciones']],
      body: dataToExport,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 }
    });
    
    doc.save(`${this.getFormattedDate()}_Lista_asistencias_${this.empleadoName}.pdf`);
  }
  
 


  getFormattedDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

    // Add the volverInventario method
    volverInventario(): void {
      this.router.navigate(["home/employee-list"]);
    }
}
