import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { jsPDF } from 'jspdf';

import * as XLSX from 'xlsx';
import 'datatables.net-bs5'; // Asegúrate de que esto esté correctamente importado
import { NgSelectModule } from '@ng-select/ng-select';
import { MovementDTO, MovementFilterDTO, MovementType } from '../../models/WarehouseMovementByProduct';
import { WarehouseMovementService } from '../../services/warehouse-movement.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

interface MovementTypeOption {
  id: MovementType;
  label: string;
}
// Definir un tipo para las columnas de filtro
type FilterColumn = 'general' | 'applicant' | 'detailProducts' | 'movement_type';
@Component({
  selector: 'app-iep-warehouse-movement-search',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './iep-warehouse-movement-search.component.html',
  styleUrls: ['./iep-warehouse-movement-search.component.css']
})
export class IepWarehouseMovementSearchComponent implements OnInit {
  movements: MovementDTO[] = [];
  private table: any;
  
  // Búsqueda y filtros
  searchTerm: string = '';
  selectedTypes: MovementType[] = [];
  selectedDate: string = '';
  private searchSubject = new Subject<string>();
  
  // Opciones para el ng-select con formato personalizado
  movementTypeOptions: MovementTypeOption[] = [
    { id: MovementType.Agregacion, label: 'Agregación' },
    { id: MovementType.Disminucion, label: 'Disminución' }
  ];

  constructor(private movementService: WarehouseMovementService) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.filterData();
      });
  }

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.movementService.findAll().subscribe({
      next: (data) => {
        this.movements = data;
        this.initializeDataTable();
      },
      error: (error) => {
        console.error('Error fetching movements:', error);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onTypeChange(): void {
    this.filterData();
  }

  onDateChange(): void {
    this.filterData();
  }

  filterData(): void {
    let filteredData = [...this.movements];
  
    // Filtrar por término de búsqueda en todos los campos
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(movement => {
        const dateStr = new Date(movement.movementDatetime).toLocaleString('es-ES');
        const quantityStr = movement.quantity.toString();
        const finalStockStr = movement.finalStock.toString();
  
        return dateStr.toLowerCase().includes(searchLower) ||
               movement.movementType.toLowerCase().includes(searchLower) ||
               movement.productName.toLowerCase().includes(searchLower) ||
               quantityStr.includes(searchLower) ||
               finalStockStr.includes(searchLower) ||
               (movement.reason?.toLowerCase() || '').includes(searchLower);
      });
    }
  
    // Filtrar por tipos seleccionados
    if (this.selectedTypes.length > 0) {
      filteredData = filteredData.filter(movement => 
        this.selectedTypes.includes(movement.movementType)
      );
    }
  
    // Filtrar por fecha (comparando solo día, mes y año)
    if (this.selectedDate) {
      // Asegúrate de que `selectedDate` esté en formato "YYYY-MM-DD"
      const [year, month, day] = this.selectedDate.split('-');
      const selectedDateStart = new Date(`${year}-${month}-${day}T00:00:00`);
      const selectedDateEnd = new Date(`${year}-${month}-${day}T23:59:59`);
  
      // Convertir la fecha del movimiento solo al formato "YYYY-MM-DD"
      filteredData = filteredData.filter(movement => {
        const movementDate = new Date(movement.movementDatetime);
        const movementDateFormatted = `${movementDate.getFullYear()}-${(movementDate.getMonth() + 1).toString().padStart(2, '0')}-${movementDate.getDate().toString().padStart(2, '0')}`;
  
        // Comparar solo día, mes y año
        const selectedDateFormatted = `${selectedDateStart.getFullYear()}-${(selectedDateStart.getMonth() + 1).toString().padStart(2, '0')}-${selectedDateStart.getDate().toString().padStart(2, '0')}`;
        
        return movementDateFormatted === selectedDateFormatted;
      });
    }
  
    // Actualizar la tabla
    if (this.table) {
      this.table.clear().rows.add(filteredData).draw();
    }
  }
  
  
  

  initializeDataTable(): void {
    const table = $('#movementTable');
  
    if ($.fn.dataTable.isDataTable('#movementTable')) {
      table.DataTable().clear().destroy();
    }
  
    if (table.length) {
      this.table = table.DataTable({
        dom: '<"mb-3"t><"d-flex justify-content-between"lp>',
        data: this.movements,
        columns: [
          {
            data: 'movementDatetime',
            title: 'Fecha y Hora',
            render: (data: string) => new Date(data).toLocaleString('es-ES') // Formato de fecha
          },
          {
            data: 'movementType',
            title: 'Tipo',
            render: (data: string) => {
              const color = data === 'Agregacion' ? 'text-bg-success' : 'text-bg-danger';
              return `<span class="badge ${color}">${data}</span>`;
            }
          },
          { data: 'productName', title: 'Producto' },
          { data: 'quantity', title: 'Cantidad', className: 'text-center' },
          {
            data: 'unitprice',
            title: 'Precio',
            className: 'text-center',
            render: (data: number) => {
              if (data > 0) {
                return `$${data.toFixed(2)}`; // Solo formatea si el precio es mayor a 0
              }
              return '$0.00'; // Valor por defecto si el precio es 0 o no está disponible
            }
          }
          
          ,          
          { 
            data: 'finalStock', 
            title: 'Stock Resultante', 
            className: 'text-center'
          }
        ],
        pageLength: 5,
        lengthMenu: [5, 10, 25, 50],
        searching: false,
        ordering: true,
        order: [[0, 'desc']], // Ordenar por fecha descendente
        autoWidth: false,
        language: {
          lengthMenu: '_MENU_',
          info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
          emptyTable: 'No se encontraron registros',
        }
      });
    }
  }

  resetFilters(): void {
    // Restablecer el término de búsqueda
    this.searchTerm = '';
  
    // Restablecer los tipos seleccionados
    this.selectedTypes = [];
  
    // Restablecer la fecha seleccionada
    this.selectedDate = '';
  
    // Filtrar los datos nuevamente después de resetear
    this.filterData();
  }
  
  
  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Movimientos de Inventario', 10, 10);  // Título
  
    // Añadir los datos filtrados de la tabla
    const filteredData = this.table.rows({ search: 'applied' }).data().toArray();
  
    // Formatear los datos para exportarlos
    const dataToExport = filteredData.map((movement: any) => [
      new Date(movement.movementDatetime).toLocaleString('es-ES'),
      movement.movementType,
      movement.productName,
      movement.quantity,
      `$${movement.unitprice.toFixed(2)}`,
      movement.finalStock
    ]);
  
    // Configurar la tabla en el PDF
    (doc as any).autoTable({
      head: [['Fecha y Hora', 'Tipo', 'Producto', 'Cantidad', 'Precio', 'Stock Resultante']],
      body: dataToExport,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });
  
    // Guardar el archivo PDF
    const formattedDate = new Date().toLocaleDateString('es-ES');
    doc.save(`${formattedDate}_Lista_Movimientos_Inventario.pdf`);
  }

  exportToExcel(): void {
    const encabezado = [
      ['Listado de Movimientos de Inventario'],
      [],  // Fila vacía para separación
      ['Fecha y Hora', 'Tipo', 'Producto', 'Cantidad', 'Precio', 'Stock Resultante']
    ];
  
    // Obtener los datos filtrados de la tabla DataTables
    const filteredData = this.table.rows({ search: 'applied' }).data().toArray();
  
    // Convertir los datos a un formato compatible con `aoa_to_sheet`
    const dataToExport = filteredData.map((movement: any) => [
      new Date(movement.movementDatetime).toLocaleString('es-ES'),
      movement.movementType,
      movement.productName,
      movement.quantity,
      `$${movement.unitprice.toFixed(2)}`,
      movement.finalStock
    ]);
  
    // Combinar el encabezado y los datos
    const worksheetData = [...encabezado, ...dataToExport];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    // Configuración de ancho de columnas
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
  
    // Crear y descargar el archivo Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos Inventario');  // Nombre de la hoja reducido
  
    const formattedDate = new Date().toLocaleDateString('es-ES');
    XLSX.writeFile(workbook, `${formattedDate}_Lista_Movimientos_Inventario_Filtrados.xlsx`);
  }
  
}


