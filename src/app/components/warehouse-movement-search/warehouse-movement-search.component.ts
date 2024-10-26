import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WarehouseMovementService } from '../../services/warehouse-movement.service';
import { GetWarehouseMovementRequest } from '../../models/GetWarehouseMovementRequest';
import { WarehouseMovement } from '../../models/getWarehouseMovementResponse';
import { WarehouseTypePipe } from '../../pipes/warehouse-type.pipe';
import { ProductService } from '../../services/product.service';

import { DtoProducto } from '../../models/dto-producto';

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
        lengthChange: false,
        searching: true,
        destroy: true, 
        language: {
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ movimientos",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior",
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
