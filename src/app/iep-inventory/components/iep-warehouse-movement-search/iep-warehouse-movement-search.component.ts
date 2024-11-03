import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, AfterViewChecked } from '@angular/core';
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

@Component({
  selector: 'app-iep-warehouse-movement-search',
  standalone: true,
  imports: [CommonModule, FormsModule, WarehouseTypePipe],
  templateUrl: './iep-warehouse-movement-search.component.html',
  styleUrls: ['./iep-warehouse-movement-search.component.css']
})
export class IepWarehouseMovementSearchComponent implements AfterViewInit, AfterViewChecked {
  applyColumnFilter($event: Event, arg1: string) {
    throw new Error('Method not implemented.');
  }
  applyFilter($event: Event) {
    throw new Error('Method not implemented.');
  }
  cleanColumnFilters() {
    throw new Error('Method not implemented.');
  }
  onEndDateChange() {
    throw new Error('Method not implemented.');
  }
  onStartDateChange() {
    throw new Error('Method not implemented.');
  }
  filtersVisible = true; // Controla la visibilidad de los filtros

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible; // Alterna la visibilidad de los filtros
  }

  movements: WarehouseMovement[] = [];
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

  constructor(private warehouseMovementService: WarehouseMovementService, private productService: ProductService) { }


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



  ngOnInit() {
    this.searchMovements();
    this.productService.productGet().subscribe((products) => {
      this.products = products;
    })
  }

  ngAfterViewInit(): void {

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
    this.warehouseMovementService.searchMovements(this.searchParams).subscribe((movements) => {
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