import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WarehouseMovementService } from '../../services/warehouse-movement.service';
import { GetWarehouseMovementRequest } from '../../models/GetWarehouseMovementRequest';
import { WarehouseMovement } from '../../models/getWarehouseMovementResponse';
import { ProductService } from '../../services/product.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DtoProducto } from '../../models/dto-producto';
import { WarehouseTypePipe } from '../../pipes/warehouse-type.pipe';
import { fromEvent, distinctUntilChanged, debounceTime } from 'rxjs';


// Definir un tipo para las columnas de filtro
type FilterColumn = 'general' | 'applicant' | 'detailProducts' | 'movement_type';

@Component({
  selector: 'app-iep-warehouse-movement-search',
  standalone: true,
  imports: [CommonModule, FormsModule, WarehouseTypePipe],
  templateUrl: './iep-warehouse-movement-search.component.html',
  styleUrls: ['./iep-warehouse-movement-search.component.css']
})
export class IepWarehouseMovementSearchComponent implements AfterViewInit, AfterViewChecked {

  endDate: Date = new Date();
  startDate: Date = new Date(this.endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  onEndDateChange(): void {
    const endDateStr = this.endDateInput?.nativeElement?.value;
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      endDate.setDate(endDate.getDate() + 1); // Añade un día para incluir la fecha seleccionada
      endDate.setHours(23, 59, 59, 999);
      this.filters.endDate = endDate;
      this.applyFilters();
    } else {
      this.filters.endDate = null;
      this.applyFilters();
    }
  }

  onStartDateChange(): void {
    const startDateStr = this.startDateInput?.nativeElement?.value;
    if (startDateStr) {
      const startDate = new Date(startDateStr);
      startDate.setDate(startDate.getDate() + 1); // Añade un día para incluir la fecha seleccionada
      startDate.setHours(0, 0, 0, 0);
      this.filters.startDate = startDate;
      this.applyFilters();
    } else {
      this.filters.startDate = null;
      this.applyFilters();
    }
  }

  ngOnInit() {
    // Establecer fecha actual para endDate
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const endDateStr = today.toISOString().split('T')[0];

    // Establecer fecha de hace 30 días para startDate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Establecer las fechas en los filtros
    this.filters.startDate = thirtyDaysAgo;
    this.filters.endDate = today;

    // Cargar los datos con los filtros ya configurados
    this.warehouseMovementService.getWarehouseMovements().subscribe((movements) => {
      this.movements = movements;

      // Llamar directamente a applyFilters después de cargar los movimientos
      this.applyFilters();

      // Establecer los valores de los inputs después de que los datos se hayan cargado
      setTimeout(() => {
        if (this.startDateInput?.nativeElement) {
          this.startDateInput.nativeElement.value = startDateStr;
        }
        if (this.endDateInput?.nativeElement) {
          this.endDateInput.nativeElement.value = endDateStr;
        }

        // Aplicar los filtros iniciales
        this.applyFilters();
      });
    });

    this.loadProducts();
  }

  cleanColumnFilters(): void {
    // Restablecer todos los filtros
    this.filters = {
      general: '',
      startDate: null,
      endDate: null,
      applicant: '',
      detailProducts: '',
      movement_type: ''
    };

    // Limpiar inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
    });

    // Limpiar específicamente los inputs de fecha
    if (this.startDateInput?.nativeElement) {
      this.startDateInput.nativeElement.value = '';
    }
    if (this.endDateInput?.nativeElement) {
      this.endDateInput.nativeElement.value = '';
    }

    // Restaurar datos originales
    this.filteredMovements = [...this.movements];
    this.updateDataTable(this.movements);
  }

  private isSameOrAfterDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() > date2.getFullYear() ||
      (date1.getFullYear() === date2.getFullYear() &&
        (date1.getMonth() > date2.getMonth() ||
          (date1.getMonth() === date2.getMonth() &&
            date1.getDate() >= date2.getDate())))
    );
  }

  private isSameOrBeforeDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() < date2.getFullYear() ||
      (date1.getFullYear() === date2.getFullYear() &&
        (date1.getMonth() < date2.getMonth() ||
          (date1.getMonth() === date2.getMonth() &&
            date1.getDate() <= date2.getDate())))
    );
  }

  // Manejador para el filtro por columna
  applyColumnFilter(event: Event, column: FilterColumn): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();

    // Asegurarse de que solo asignamos strings a las columnas de string
    if (column === 'general' || column === 'applicant' || column === 'detailProducts' || column === 'movement_type') {
      this.filters[column] = filterValue;
      this.applyFilters();
    }
  }

  movements: WarehouseMovement[] = [];
  filteredMovements: WarehouseMovement[] = [];

  @ViewChild('startDateInput') startDateInput!: ElementRef;
  @ViewChild('endDateInput') endDateInput!: ElementRef;

  filtersVisible = false;

  // Objeto para mantener el estado de los filtros
  // Y modificar la definición del objeto filters para ser más específica
  filters: {
    general: string;
    startDate: Date | null;
    endDate: Date | null;
    applicant: string;
    detailProducts: string;
    movement_type: string;
  } = {
      general: '',
      startDate: null,
      endDate: null,
      applicant: '',
      detailProducts: '',
      movement_type: ''
    };

  constructor(
    private warehouseMovementService: WarehouseMovementService,
    private productService: ProductService
  ) { }

  ngAfterViewInit() {
    // Configurar listeners para los inputs con debounce
    this.setupFilterListeners();
  }

  private setupFilterListeners() {
    // Configurar listener para el filtro general
    const filterInput = document.getElementById('filterInput');
    if (filterInput) {
      fromEvent(filterInput, 'input')
        .pipe(
          debounceTime(0),
          distinctUntilChanged()
        )
        .subscribe((event: any) => {
          this.filters.general = event.target.value.toLowerCase().trim();
          this.applyFilters();
        });
    }

    // Configurar listeners para los filtros de columna
    const columnInputs = document.querySelectorAll('input[data-column]');
    columnInputs.forEach(input => {
      fromEvent(input, 'input')
        .pipe(
          debounceTime(0),
          distinctUntilChanged()
        )
        .subscribe((event: any) => {
          const column = event.target.getAttribute('data-column');
          if (column) {
            this.filters[column as keyof typeof this.filters] = event.target.value.toLowerCase().trim();
            this.applyFilters();
          }
        });
    });
  }

  private loadProducts() {
    this.productService.productGet().subscribe(products => {
      this.products = products;
    });
  }

  // Método principal para aplicar todos los filtros
  private applyFilters() {
    let result = [...this.movements];

    // Aplicar filtros de fecha primero
    if (this.filters.startDate) {
      result = result.filter(movement => {
        const movementDate = new Date(movement.date);
        movementDate.setHours(0, 0, 0, 0); // Normalizar la hora para comparación
        return this.isSameOrAfterDate(movementDate, this.filters.startDate!);
      });
    }

    if (this.filters.endDate) {
      result = result.filter(movement => {
        const movementDate = new Date(movement.date);
        movementDate.setHours(23, 59, 59, 999); // Normalizar la hora para comparación
        return this.isSameOrBeforeDate(movementDate, this.filters.endDate!);
      });
    }

    // Aplicar filtro general
    if (this.filters.general) {
      result = result.filter(movement => {
        const productsString = movement.detailProducts
          .map(product => product.description.toLowerCase())
          .join(' ');

        return (
          movement.applicant.toLowerCase().includes(this.filters.general) ||
          movement.responsible.toLowerCase().includes(this.filters.general) ||
          movement.movement_type.toLowerCase().includes(this.filters.general) ||
          productsString.includes(this.filters.general)
        );
      });
    }

    // Aplicar filtros de columna
    if (this.filters.applicant) {
      result = result.filter(movement =>
        movement.applicant.toLowerCase().includes(this.filters.applicant)
      );
    }

    if (this.filters.detailProducts) {
      result = result.filter(movement => {
        const productsString = movement.detailProducts
          .map(product => product.description.toLowerCase())
          .join(' ');
        return productsString.includes(this.filters.detailProducts);
      });
    }

    if (this.filters.movement_type) {
      result = result.filter(movement =>
        movement.movement_type.toLowerCase().includes(this.filters.movement_type)
      );
    }

    this.filteredMovements = result;
    this.updateDataTable(result);
  }

  // Objeto para mantener el estado de los filtros de columna
  columnFilters = {
    applicant: '',
    detailProducts: '',
    movement_type: ''
  };

  // Filtro general que aplica a todas las columnas excepto fechas
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();

    // Filtrar los movimientos basados en el valor de búsqueda
    this.filteredMovements = this.movements.filter(movement => {
      // Convertir los productos a string para búsqueda
      const productsString = movement.detailProducts
        .map(product => product.description.toLowerCase())
        .join(' ');

      return (
        movement.applicant.toLowerCase().includes(filterValue) ||
        movement.responsible.toLowerCase().includes(filterValue) ||
        movement.movement_type.toLowerCase().includes(filterValue) ||
        productsString.includes(filterValue)
      );
    });

    // Actualizar la tabla con los resultados filtrados
    this.updateDataTable(this.filteredMovements);
  }

  // Método privado para aplicar filtros de fecha
  private applyDateFilters(): void {
    const startDate = this.startDateInput?.nativeElement?.value ?
      new Date(this.startDateInput.nativeElement.value) : null;
    const endDate = this.endDateInput?.nativeElement?.value ?
      new Date(this.endDateInput.nativeElement.value) : null;

    // Si no hay fechas seleccionadas, mantener los filtros actuales
    if (!startDate && !endDate) return;

    this.filteredMovements = this.filteredMovements.filter(movement => {
      const movementDate = new Date(movement.date);

      if (startDate && endDate) {
        return movementDate >= startDate && movementDate <= endDate;
      } else if (startDate) {
        return movementDate >= startDate;
      } else if (endDate) {
        return movementDate <= endDate;
      }
      return true;
    });
  }



  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible; // Alterna la visibilidad de los filtros
    if(this.filtersVisible){
      this.cleanColumnFilters();
    }
  }

  products: DtoProducto[] = [];
  selectedMovement: WarehouseMovement | undefined;
  dataTableInstance: any;
  tableInitialized = false;

  // Parámetros de búsqueda que se enlazan al formulario
  searchParams: GetWarehouseMovementRequest = {
    createdDate: new Date().toISOString().split('T')[0], // Fecha actual
    applicantOrResponsible: undefined,
    productId: undefined,
    movementType: undefined,
    detailCount: undefined
  };



  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  }

  translateMovementType(type: string): string {
    switch (type) {
      case 'RETURN':
        return 'Devolución';
      case 'LOAN':
        return 'Préstamo';
      case 'TO_MAINTENANCE':
        return 'Uso';
      default:
        return type;
    }
  }

  private getProductNameById(productId: number): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : 'Desconocido';
  }
  

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Movimientos', 10, 10);

    // Ajustar los datos exportados para que coincidan con la tabla
    const dataToExport = this.movements.map((movement) => [
      new Date(movement.date).toLocaleString('es-ES'),   
      movement.applicant,                               
      movement.detailProducts.map((product) => this.getProductNameById(product.productId)).join(', '),               
      this.translateMovementType(movement.movement_type),                            
      movement.responsible                               
    ]);

    // Configuración de la tabla en el PDF
    (doc as any).autoTable({
      head: [['Fecha y Hora', 'Solicitante', 'Productos', 'Tipo', 'Responsable']],
      body: dataToExport,
      startY: 20,
    });

    const formattedDate = this.getFormattedDate();
    doc.save(`Lista_Movimientos_${formattedDate}.pdf`);
}


exportToExcel(): void {
  const dataToExport = this.movements.map((movement) => ({
    'Fecha y Hora': new Date(movement.date).toLocaleString('es-ES'),  
    'Solicitante': movement.applicant,                               
    'Productos': movement.detailProducts.map((product) => this.getProductNameById(product.productId)).join(', '),                     
    'Tipo': this.translateMovementType(movement.movement_type),                                 
    'Responsable': movement.responsible                              
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Movimientos');

  const formattedDate = this.getFormattedDate();
  XLSX.writeFile(workbook, `Lista_Movimientos_${formattedDate}.xlsx`);
}



  ngAfterViewChecked(): void {

    if (this.movements.length > 0 && !this.tableInitialized) {
      this.initializeDataTable();
    }
  }

  initializeDataTable(): void {
    $(document).ready(() => {
      this.dataTableInstance = $('#movementsTable').DataTable({
        data: this.movements,
        dom:
          '<"mb-3"t>' +                           //Tabla
          '<"d-flex justify-content-between"lp>', //Paginacion
        columns: [
          {
            data: 'date',
            title: 'Fecha y Hora',

            render: (data: string) => {
              if (!data) return '';
              const date = new Date(data);
              if (isNaN(date.getTime())) return '';
              return this.formatearFecha(date)
            }
          },

          { data: 'applicant', title: 'Solicitante' },
          {
            data: 'detailProducts',
            title: 'Productos',
            render: (data: any[]) => {
              const descriptions = data.map(p => p.description).join(', ');
              return descriptions.length > 100 ? descriptions.substring(0, 100) + '...' : descriptions;
            }
          },
          {
            data: 'movement_type',
            title: 'Tipo',
            render: (data: string) => {
              switch (data) {
                case 'RETURN':
                  return 'Devolución';
                case 'LOAN':
                  return 'Préstamo';
                case 'TO_MAINTENANCE':
                  return 'Uso';
                default:
                  return data;
              }
            }
          },
          { data: 'responsible', title: 'Responsable' },
          {
            data: null,
            title: 'Acciones',
            render: (data: any) => {
              return `<button class="btn btn-sm btn-info btn-ver-mas" data-bs-toggle="modal" data-bs-target="#infoModal" data-id="${data.id}">Ver más</button>`;
            }
          }
        ],
        order: [[0, 'desc']],
        pageLength: 10,
        lengthChange: true,
        searching: false,
        destroy: true,
        language: {
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ movimientos",
          lengthMenu:
            `<select class="form-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
          emptyTable: "No hay datos disponibles en la tabla",
        }
      });


      $('#movementsTable tbody').on('click', '.btn-ver-mas', (event) => {
        const id = $(event.currentTarget).data('id');
        this.openModal(id);
      });

      this.tableInitialized = true;
    });
  }


  formatearFecha(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes comienza en 0
    const anio = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }

  updateDataTable(newMovements: WarehouseMovement[]): void {
    if (this.dataTableInstance) {
      this.dataTableInstance.clear();
      this.dataTableInstance.rows.add(newMovements);
      this.dataTableInstance.draw();
    } else {
      this.initializeDataTable();
    }
  }

  searchMovements() {
    this.warehouseMovementService.getWarehouseMovements().subscribe((movements) => {
      this.movements = movements;
      this.updateDataTable(movements);
    });
  }

  openModal(id: number) {
    this.movements.forEach((movement) => {
      if (movement.id === id) {
        this.selectedMovement = movement;

      }
    })
  }
}