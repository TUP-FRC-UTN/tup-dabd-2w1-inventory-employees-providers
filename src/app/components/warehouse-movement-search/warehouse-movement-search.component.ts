import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WarehouseMovementService } from '../../services/warehouse-movement.service';
import { GetWarehouseMovementRequest } from '../../models/GetWarehouseMovementRequest';
import { WarehouseMovement } from '../../models/getWarehouseMovementResponse';
import { WarehouseTypePipe } from '../../pipes/warehouse-type.pipe';
import { ProductService } from '../../services/product.service';
import { DtoProducto } from '../../models/dto-producto';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-warehouse-movement-search',
  standalone: true,
  imports: [CommonModule, FormsModule,WarehouseTypePipe],
  templateUrl: './warehouse-movement-search.component.html',
  styleUrls: ['./warehouse-movement-search.component.css']
})
export class WarehouseMovementSearchComponent implements AfterViewInit, AfterViewChecked {
  movements: WarehouseMovement[] = [];
  products:DtoProducto[]=[];
  selectedMovement:WarehouseMovement | undefined;
  dataTableInstance: any;
  tableInitialized = false;

  // Parámetros de búsqueda que se enlazan al formulario
  searchParams: GetWarehouseMovementRequest = {
    createdDate: undefined,
    applicantOrResponsible: undefined,
    productId: undefined,
    movementType: undefined,
    detailCount: undefined
  };

  constructor(private warehouseMovementService: WarehouseMovementService,private productService: ProductService ) {}

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Movimientos', 10, 10);

    const dataToExport = this.movements.map((movement) => [
      movement.id,
      new Date(movement.date).toLocaleString('es-ES'), // Formats date as shown in the table
      movement.applicant,
      movement.responsible,
      movement.movement_type,
      movement.detailProducts.length, // Número de productos en el movimiento
      movement.employee_id,
      new Date(movement.reinstatement_datetime).toLocaleString('es-ES') // Formats reinstatement date
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Fecha', 'Solicitante', 'Responsable', 'Tipo de Movimiento', 'Cantidad de Productos', 'ID Empleado', 'Fecha Reincorporación']],
      body: dataToExport,
      startY: 20,
    });

    doc.save('Lista_Movimientos.pdf');
  }

  exportToExcel(): void {
    const dataToExport = this.movements.map((movement) => ({
      'ID': movement.id,
      'Fecha': new Date(movement.date).toLocaleString('es-ES'), // Format date as dd/mm/yyyy hh:mm
      'Solicitante': movement.applicant,
      'Responsable': movement.responsible,
      'Tipo de Movimiento': movement.movement_type,
      'Cantidad de Productos': movement.detailProducts.length,
      'ID Empleado': movement.employee_id,
      'Fecha Reincorporación': new Date(movement.reinstatement_datetime).toLocaleString('es-ES'), // Format reinstatement date
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Movimientos');

    XLSX.writeFile(workbook, 'Lista_Movimientos.xlsx');
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
        columns: [
          {
            data: 'date',
            title: 'Hora',
            render: (data: string) => {
              if (!data) return '';
              const date = new Date(data);
              if (isNaN(date.getTime())) return '';
              return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
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
              switch(data) {
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
              return `<button class="btn btn-sm btn-primary btn-ver-mas" data-bs-toggle="modal" data-bs-target="#infoModal" data-id="${data.id}">Ver más</button>`;
            }
          }
        ],
        pageLength: 10,
        lengthChange: true,
        lengthMenu:[10, 25, 50],
        searching: false,
        destroy: true, 
        language: {
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ movimientos",
          paginate: {
            first: '<<',
            last: '>>',
            next: '>',
            previous: '<',
          },
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
