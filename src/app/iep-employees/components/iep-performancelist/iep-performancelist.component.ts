import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { EmployeePerformance } from '../../Models/listado-desempeño';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WakeUpCallDetail } from '../../Models/listado-desempeño';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import $ from 'jquery';
declare var bootstrap: any; // Añadir esta declaración al principio
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
  paginatedDetails: WakeUpCallDetail[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  selectedEmployeeId: number | null = null; // Variable para almacenar el ID del empleado seleccionado
  selectedEmployeeName: string = '';         // Nombre del empleado seleccionado
  selectedYears: string[] = [];  // Cambiado a array
  selectedMonths: string[] = []; // Cambiado a array
  selectedPerformanceType: string[] = [];  // Cambiado de string a string[]
  showFilters = false; // Inicializamos como oculto
  showNewCallModal = false; // Variable para controlar la visibilidad del modal
  showConfirmationModal = false;
  showErrorModal = false;
  confirmationMessage = '';
  errorMessage = '';
  selectedObservationCount: number | null = null;  // Nuevo filtro de observaciones
  performanceTypes: string[] = ['BUENO', 'REGULAR', 'MALO'];  // Opciones de tipo de desempeño
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
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Inicializar los arrays
    this.selectedYears = [];
    this.selectedMonths = [];
    
    // Obtener fecha actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = this.months[currentDate.getMonth()]; // Obtener nombre del mes actual
    
    // Establecer valores iniciales
    this.selectedYears.push(currentYear);
    this.selectedMonths.push(currentMonth);
  }


  ngOnInit(): void {
    const empleadoId = this.route.snapshot.paramMap.get('id');
    if (empleadoId) {
      this.setEmployeeById(Number(empleadoId)); // Carga los datos del empleado específico
    }
    this.loadData();
    this.employeeService.refreshData();
    
    // Agregar evento para el modal
    const modalElement = document.getElementById('newCall');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.loadData();
      });
    }

    // Marcar los checkboxes del año y mes actual
    setTimeout(() => {
      this.updateCheckboxes();
    }, 100);
  }

  // Método para establecer el ID de empleado, obtener su nombre y cargar sus datos de desempeño
  // Dentro de tu componente principal (ej. IepPerformancelistComponent)
setEmployeeById(employeeId: number): void {
  this.selectedEmployeeId = employeeId;

  // Llama al servicio para obtener el empleado por ID y actualizar el nombre
  this.employeeService.getEmployees().subscribe(employees => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      this.selectedEmployeeName = employee.fullName;
      this.searchTerm = employee.fullName; // Establece el término de búsqueda con el nombre
      this.loadData(); // Carga los datos del desempeño del empleado
    }
  });
}

// Al abrir el modal
openNewCallModal(employeeId: number) {
  this.setEmployeeById(employeeId); // Establece el empleado seleccionado
  this.showNewCallModal = true; // Muestra el modal
}

  ngAfterViewInit(): void {
    // Llama a filterData para aplicar el filtro inicial
    setTimeout(() => {
      this.filterData();
    }, 100);
  }
  
  // Nuevo método para actualizar los checkboxes
  private updateCheckboxes(): void {
    // Actualizar checkbox del año
    const yearCheckboxes = document.querySelectorAll('[aria-labelledby="dropdownYearSelect"] input[type="checkbox"]');
    yearCheckboxes.forEach((checkbox: any) => {
      if (checkbox.parentElement.textContent.trim() === this.selectedYears[0]) {
        checkbox.checked = true;
      }
    });

    // Actualizar checkbox del mes
    const monthCheckboxes = document.querySelectorAll('[aria-labelledby="dropdownMonthSelect"] input[type="checkbox"]');
    monthCheckboxes.forEach((checkbox: any) => {
      if (checkbox.parentElement.textContent.trim() === this.selectedMonths[0]) {
        checkbox.checked = true;
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
    //if (this.showFilters) {
    //  this.resetFilters(); // Esto ahora mantendrá el año y mes actual
    //}
  }

  ngOnDestroy() {
    // Destruir la tabla cuando el componente se destruye
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  // Método auxiliar para recargar datos
  loadData(): void {
    this.employeeService.getCombinedData().subscribe({
      next: (data) => {
        this.performances = data;
        this.setAvailableYears();
        
        if (this.dataTable) {
          this.dataTable.clear();
          this.dataTable.rows.add(this.performances);
          this.dataTable.draw();
        } else {
          setTimeout(() => {
            this.initializeDataTable();
          }, 0);
        }
      },
      error: (error) => {
        console.error('Error loading data:', error);
      }
    });
  }

  closeNewCallModal() {
    this.closeModal(); // Cierra el modal y al mismo tiempo se actualizan los datos
  }
  

  private closeModal() {
    const modalElement = document.getElementById('newCall');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      
      // Limpieza completa del modal y sus efectos
      setTimeout(() => {
        // Remover clases del body
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');
        
        // Remover todos los backdrops
        const backdrops = document.getElementsByClassName('modal-backdrop');
        while (backdrops.length > 0) {
          backdrops[0].remove();
        }

        // Limpiar el modal
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');
        
        // Remover cualquier estilo inline que Bootstrap pueda haber añadido
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach(modal => {
          (modal as HTMLElement).style.display = 'none';
        });
      }, 100);
    }
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
          { 
            data: null,
            render: (data: any) => {
              // Formatear el mes para asegurar que tenga dos dígitos
              const month = data.month.toString().padStart(2, '0');
              return `${data.year}-${month}`;
            },
            title: 'Periodo'
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
              return `<button class="btn btn-sm btn-primary view-details" data-bs-target="#viewDetail" data-bs-toggle="modal" data-id="${row.id}" data-year="${row.year}" data-month="${row.month}">Ver más</button>`;
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
        order: [[0, 'desc']],
        dom: 'rt<"d-flex justify-content-between mt-3"l<"pagination-container"p>>',
        lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]]
      });
  
      // Listener para el botón de detalles
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

  resetFilters() {
    // Limpiar todos los valores de filtro excepto el campo de búsqueda
    this.selectedYears = [];
    this.selectedMonths = [];
    this.selectedPerformanceType = [];
    this.selectedObservationCount = null;

    // Limpiar el campo de observaciones
    const observationInput = document.getElementById('observationCount') as HTMLInputElement;
    if (observationInput) {
      observationInput.value = '';
    }

    // Desmarcar todos los checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });

    // Limpiar la búsqueda de DataTables y los filtros personalizados sin afectar `searchTerm`
    if (this.dataTable) {
        // Remover todos los filtros personalizados
        while ($.fn.dataTable.ext.search.length > 0) {
            $.fn.dataTable.ext.search.pop();
        }

        // No modificar la búsqueda global porque `searchTerm` debe mantenerse
        this.dataTable.columns().search(''); // Limpiar solo la búsqueda de columnas

        // Recargar los datos originales
        this.loadData();
        this.dataTable.draw();
    }

    // Emitir evento de cambio solo para los campos que se limpiaron
    setTimeout(() => {
        const event = new Event('input');
        if (observationInput) {
            observationInput.dispatchEvent(event);
        }
    }, 0);
}


  // Modificar el método filterData() para trabajar con la nueva estructura
  filterData(): void {
    if (!this.dataTable) return;

    this.dataTable.search(this.searchTerm);

    while ($.fn.dataTable.ext.search.length > 0) {
      $.fn.dataTable.ext.search.pop();
    }

    $.fn.dataTable.ext.search.push((settings: any, data: any[]) => {
      const period = data[0]; // El período ahora está en la primera columna
      const [yearStr, monthStr] = period.split('-');
      const rowYear = yearStr;
      const rowMonth = this.getMonthName(parseInt(monthStr, 10));
      const rowPerformanceType = data[3];
      const rowObservationCount = parseInt(data[2], 10);

      const yearMatch = this.selectedYears.length === 0 ||
        this.selectedYears.includes(rowYear);

      const monthMatch = this.selectedMonths.length === 0 ||
        this.selectedMonths.includes(rowMonth);

      const performanceTypeMatch = this.selectedPerformanceType.length === 0 ||
        this.selectedPerformanceType.includes(rowPerformanceType);

      const observationCountMatch = this.selectedObservationCount === null ||
        rowObservationCount === this.selectedObservationCount;

      return yearMatch && monthMatch && performanceTypeMatch && observationCountMatch;
    });

    this.dataTable.draw();
  }


  getMonthName(month: number): string {
    return this.months[month - 1];
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
  
  
  viewDetails(employeeId: number, year: number, month: number): void {
    this.employeeService.getWakeUpCallDetails().subscribe(details => {
      this.selectedEmployeeDetails = details
        .filter(detail => {
          const detailDate = new Date(detail.dateReal[0], detail.dateReal[1] - 1, detail.dateReal[2]);
          return detail.employeeId === employeeId && 
                 detailDate.getFullYear() === year && 
                 detailDate.getMonth() === month - 1;
        })
        .sort((a, b) => {
          const dateA = new Date(a.dateReal[0], a.dateReal[1] - 1, a.dateReal[2]);
          const dateB = new Date(b.dateReal[0], b.dateReal[1] - 1, b.dateReal[2]);
          return dateB.getTime() - dateA.getTime(); // Ordenar de más reciente a más antiguo
        });
  
      this.totalPages = Math.ceil(this.selectedEmployeeDetails.length / this.itemsPerPage);
      this.paginate();
      this.showDetailsModal = true;
    });
  }
  
  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedDetails = this.selectedEmployeeDetails.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }
  
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
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

  splitObservation(observacion: string): string[] {
    const lineLength = 50;
    const lines = [];
    
    for (let i = 0; i < observacion.length; i += lineLength) {
      lines.push(observacion.slice(i, i + lineLength));
    }
    
    return lines;
  }

  // En tu componente Angular
  formatObservation(observation: string): string[] {
    const chunkSize = 50;
    const result = [];
    for (let i = 0; i < observation.length; i += chunkSize) {
      result.push(observation.slice(i, i + chunkSize));
    }
    return result;
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
      performance.year,
      this.months[performance.month - 1],
      performance.fullName,
      performance.totalObservations,
      performance.performanceType,
    ]);
  
    (doc as any).autoTable({
      head: [['Año', 'Mes', 'Empleado', 'Observaciones', 'Desempeño']],
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
      'Año': performance.year,
      'Mes': this.months[performance.month - 1],
      'Empleado': performance.fullName,
      'Observaciones': performance.totalObservations,
      'Desempeño': performance.performanceType,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Desempeños Filtrados');

    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `Lista_Desempeños_Filtrados_${formattedDate}.xlsx`);
  }

  // Método para manejar la selección de años
  toggleYear(year: string): void {
    const index = this.selectedYears.indexOf(year);
    if (index === -1) {
      this.selectedYears.push(year);
    } else {
      this.selectedYears.splice(index, 1);
    }
    this.filterData();
  }

  // Método para manejar la selección de meses
  toggleMonth(month: string): void {
    const index = this.selectedMonths.indexOf(month);
    if (index === -1) {
      this.selectedMonths.push(month);
    } else {
      this.selectedMonths.splice(index, 1);
    }
    console.log(this.selectedMonths);
    this.filterData();
  }

  getMonthIndex(monthName: string): number {
    return this.months.findIndex(month => month === monthName) + 1;
  }

  togglePerformanceType(type: string): void {
    const index = this.selectedPerformanceType.indexOf(type);
    if (index === -1) {
      this.selectedPerformanceType.push(type);
    } else {
      this.selectedPerformanceType.splice(index, 1);
    }
    this.filterData();
  }

  
}
