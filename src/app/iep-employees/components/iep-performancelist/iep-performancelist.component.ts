
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { EmployeePerformance } from '../../Models/listado-desempeño';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { WakeUpCallDetail } from '../../Models/listado-desempeño';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net'; // Importación de DataTables
import 'datatables.net-dt'; // Estilos para DataTables
import { BrowserModule } from '@angular/platform-browser';
import { IepAttentionCallComponent } from '../iep-attention-call/iep-attention-call.component';

@Component({
  selector: 'app-iep-performancelist',
  standalone: true,
  imports: [CommonModule, FormsModule, IepAttentionCallComponent],
  templateUrl: './iep-performancelist.component.html',
  styleUrl: './iep-performancelist.component.css'
})
export class IepPerformancelistComponent implements OnInit {
  showFilters = false; // Inicializamos como oculto
  showModal = false;
  showConfirmationModal = false;
  showErrorModal = false;
  confirmationMessage = '';
  filteredPerformances: EmployeePerformance[] = [];
  errorMessage = '';
  selectedPerformanceType: string = '';  // Nuevo filtro de tipo de desempeño
  selectedObservationCount: number | null = null;  // Nuevo filtro de observaciones
  performanceTypes: string[] = [ 'BUENO', 'REGULAR', 'MALO'];  // Opciones de tipo de desempeño
  performances: EmployeePerformance[] = [];
  searchTerm: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';
  dataTable: any;
  selectedEmployeeDetails: WakeUpCallDetail[] = [];
  showDetailsModal = false;
  availableYears: number[] = [];
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  showInfoModal = false; // Nueva variable para el modal de información

  constructor(
    private employeeService: ListadoDesempeñoService,
    private router: Router
  ) {
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear().toString();
    this.selectedMonth = (currentDate.getMonth() + 1).toString();
  }
  ngOnInit(): void {
    // Primero obtenemos los datos
    this.loadData();
    this.employeeService.refreshData();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters; // Alternar entre mostrar/ocultar
    if(this.showFilters) {
      this.resetFilters(); // Limpiar los filtros si se ocultan
    }
  }

  ngOnDestroy() {
    // Destruir la tabla cuando el componente se destruye
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  loadData(): void {
    this.employeeService.getCombinedData().subscribe({
      next: (data) => {
        this.performances = data;
        this.setAvailableYears();
        if (!this.availableYears.includes(parseInt(this.selectedYear))) {
          this.selectedYear = this.availableYears[0]?.toString() || '';
        }
        // Inicializamos la tabla después de que los datos estén disponibles
        setTimeout(() => {
          this.initializeDataTable();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading data:', error);
      }
    });
  }

  initializeDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  
    const table = $('.data-table');
    if (table.length > 0) {
      this.dataTable = table.DataTable({
        data: this.performances,
        columns: [
          { data: 'year' },
          { 
            data: 'month',
            render: (data: number) => this.getMonthName(data)
          },
          { data: 'fullName' },
          { data: 'totalObservations', className: 'text-center' },
          { 
            data: 'performanceType',
            render: (data: string) => {
              return `<span class="tag ${data.toLowerCase()}">${data}</span>`;
            }
          },
          {
            data: 'totalObservations',
            render: (data: number, type: string, row: any) => {
              return `<button class="btn btn-sm btn-primary view-details" data-id="${row.id}" data-year="${row.year}" data-month="${row.month}">Ver más</button>`;
            }
          }
        ],
        language: {
          lengthMenu: "_MENU_",
          zeroRecords: "No se encontraron registros",
          info: "", 
          infoEmpty: "",
          infoFiltered: "",
          search: ""
        },
        pageLength: 10,
        order: [[0, 'desc'], [1, 'desc']],
        dom: 'rt<"d-flex justify-content-between mt-3"l<"pagination-container"p>>', // Clase personalizada para paginación
        lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]]
      });
  
      // Agregar listener para el botón de detalles
      $('.data-table tbody').on('click', '.view-details', (event) => {
        const button = $(event.currentTarget);
        const employeeId = button.data('id');
        const year = button.data('year');
        const month = button.data('month');
        
        this.viewDetails(employeeId, year, month);
      });
    }
  }
  

  setAvailableYears(): void {
    const years = this.performances.map(p => p.year);
    this.availableYears = [...new Set(years)].sort((a, b) => b - a);
  }

  // Método para limpiar los filtros
  resetFilters() {
    this.searchTerm = '';
    this.selectedYear = '';
    this.selectedMonth = '';
    this.selectedPerformanceType = '';
    this.selectedObservationCount = null;
    this.filterData();  // Llamar a filterData para refrescar la tabla
  }

  // Método para aplicar los filtros
  filterData(): void {
    if (!this.dataTable) return;

    this.dataTable.search(this.searchTerm);

    // Filtrar datos según filtros seleccionados
    $.fn.dataTable.ext.search.push((settings: any, data: any[]) => {
      const rowYear = data[0];
      const rowMonth = data[1];
      const rowPerformanceType = data[4];
      const rowObservationCount = parseInt(data[3], 10);

      const yearMatch = this.selectedYear === '' || rowYear === this.selectedYear;
      const monthMatch = this.selectedMonth === '' || rowMonth === this.getMonthName(parseInt(this.selectedMonth));
      const performanceTypeMatch = this.selectedPerformanceType === '' || rowPerformanceType === this.selectedPerformanceType;
      const observationCountMatch = this.selectedObservationCount === null || rowObservationCount === this.selectedObservationCount;

      return yearMatch && monthMatch && performanceTypeMatch && observationCountMatch;
    });

    this.dataTable.draw();
  }
  getMonthName(month: number): string {
    return this.months[month - 1];
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.loadData();
  }

  navigateToWakeUpCallForm(): void {
    this.router.navigate(['/wake-up-call']);
  }

  openInfoModal() { // Nueva función para abrir el modal de información
    this.showInfoModal = true;
  }

  closeInfoModal() { // Nueva función para cerrar el modal de información
    this.showInfoModal = false;
  }
  handleConfirmationMessage(message: string) {
    this.confirmationMessage = message;
    this.showConfirmationModal = true;
  }

  handleErrorMessage(message: string) {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
    this.loadData(); // Recargar los datos después de cerrar el modal de confirmación
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.filterData();
    }, 100);
  }

  viewDetails(employeeId: number, year: number, month: number): void {
    this.employeeService.getWakeUpCallDetails().subscribe(details => {
      this.selectedEmployeeDetails = details.filter(detail => {
        const detailDate = new Date(detail.dateReal[0], detail.dateReal[1] - 1, detail.dateReal[2]);
        return detail.employeeId === employeeId && 
               detailDate.getFullYear() === year && 
               detailDate.getMonth() === month - 1;
      });
      this.showDetailsModal = true;
    });
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }
  
  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${day}-${month}-${year}`;
  }

  // Funciones de exportación
  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Desempeños de Empleados (Filtrados)', 10, 10);
  
    // Obtener los datos filtrados de la tabla DataTables
    const filteredData = this.dataTable
      .rows({ search: 'applied' })
      .data()
      .toArray();
  
    const dataToExport = filteredData.map((performance: any) => [
      performance.fullName,
      performance.year,
      this.months[performance.month - 1],
      performance.totalObservations,
      performance.performanceType,
    ]);
  
    (doc as any).autoTable({
      head: [['Nombre Completo', 'Año', 'Mes', 'Total Observaciones', 'Tipo de Desempeño']],
      body: dataToExport,
      startY: 20,
    });
  
    const formattedDate = this.getFormattedDate();
    doc.save(`Lista_Desempeños_Filtrados_${formattedDate}.pdf`);
  }
  
  exportToExcel(): void {
    // Obtener los datos filtrados de la tabla DataTables
    const filteredData = this.dataTable
      .rows({ search: 'applied' })
      .data()
      .toArray();
  
    const dataToExport = filteredData.map((performance: any) => ({
      'Nombre Completo': performance.fullName,
      'Año': performance.year,
      'Mes': this.months[performance.month - 1],
      'Total Observaciones': performance.totalObservations,
      'Tipo de Desempeño': performance.performanceType,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Desempeños Filtrados');

    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `Lista_Desempeños_Filtrados_${formattedDate}.xlsx`);
  }
}