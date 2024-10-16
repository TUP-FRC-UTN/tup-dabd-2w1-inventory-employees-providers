import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Producto } from '../../models/producto';
import 'datatables.net';
import 'datatables.net-bs5';
import $ from 'jquery';
import * as XLSX from 'xlsx';
import { GenerateExcelPdfService } from '../../services/generate-excel-pdf.service';
import { ToastrService } from 'ngx-toastr';
import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css'],
})
export class TablaComponent implements OnInit, AfterViewInit, OnDestroy {
  private table: any; // Referencia para la instancia de DataTable
  productos: Producto[] = []; // Array para almacenar los productos
  filteredProductos: Producto[] = []; // Array para almacenar productos filtrados

  exportButtonsEnabled: boolean = true; // Controla la habilitación de los botones
  private stockMap: Map<string, number> = new Map();

  constructor(
    private productService: ProductService,
    private excelPdfService: GenerateExcelPdfService
  ) {}

  onStartDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById(
      'startDate'
    ) as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById(
      'endDate'
    ) as HTMLInputElement;

    const startDate = new Date(startDateInput.value);
    const today = new Date(); // Fecha actual

    // Actualiza el valor máximo del campo "Hasta". No puede ser mayor a al fecha actual. Se deben bloquear las fechas futuras
    // Bloquear fechas futuras en el campo "Hasta"
    const formattedToday = today.toISOString().split('T')[0]; // Obtener la fecha actual en formato yyyy-MM-dd
    endDateInput.max = formattedToday; // Establecer el valor máximo como la fecha actual

    // Actualiza el valor mínimo del campo "Hasta"
    if (startDate) {
      endDateInput.min = startDateInput.value; // Deshabilitar fechas anteriores a la fecha de inicio
    } else {
      endDateInput.min = ''; // Restablecer si no hay fecha de inicio
    }

    this.filterByDate(); // Filtrar los productos
  }

  onEndDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById(
      'startDate'
    ) as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById(
      'endDate'
    ) as HTMLInputElement;

    const endDate = new Date(endDateInput.value);

    // Actualiza el valor máximo del campo "Desde"
    if (endDate) {
      startDateInput.max = endDateInput.value; // Deshabilitar fechas posteriores a la fecha de fin
    } else {
      startDateInput.max = ''; // Restablecer si no hay fecha de fin
    }

    this.filterByDate(); // Filtrar los productos
  }

  ngOnInit(): void {
    this.setInitialDates();
    this.loadProductos(); // Carga los productos al inicializar el componente
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

  ngAfterViewInit(): void {
    this.initializeDataTable(); // Inicializa DataTable después de que la vista esté lista
  }

  // Método para cargar productos desde el servicio
  loadProductos(): void {
    this.productService.getProductos().subscribe({
      next: (productos) => {
        this.productos = this.calculateRunningStock(productos);
        this.filteredProductos = [...this.productos];
        if (this.table) {
          this.table.destroy();
        }
        this.initializeDataTable();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      },
    });
  }

  calculateRunningStock(productos: Producto[]): Producto[] {
    const stockMap = new Map<string, number>();

    return productos.map((producto) => {
      const currentStock = stockMap.get(producto.product) || 0;
      let newStock: number;

      if (producto.modificationType === 'Aumento') {
        newStock = currentStock + producto.amount;
      } else if (producto.modificationType === 'Disminución') {
        newStock = currentStock - producto.amount;
      } else {
        newStock = currentStock; // En caso de otro tipo de movimiento
      }

      stockMap.set(producto.product, newStock);

      return {
        ...producto,
        date: this.formatDate(producto.date),
        stockAfterModification: newStock,
      };
    });
  }

  // Método para formatear la fecha al formato dd/MM/yyyy
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Método que inicializa el DataTable
  initializeDataTable(): void {
    this.table = $('#historialTable').DataTable({
      data: this.filteredProductos, // Usar la lista filtrada
      columns: [
        { data: 'date', title: 'Fecha' }, // Columna de fecha
        { data: 'product', title: 'Producto' }, // Columna de producto
        { data: 'modificationType', title: 'Tipo Movimiento' }, // Columna de tipo de movimiento
        { data: 'supplier', title: 'Proveedor' }, // Columna de proveedor
        { data: 'amount', title: 'Cantidad' }, // Columna de cantidad
        { data: 'description', title: 'Justificativo' }, // Columna de justificativo
        { data: 'stockAfterModification', title: 'Stock Después' },
      ],
      pageLength: 10, // Número de registros por página
      lengthChange: false, // Deshabilita el selector de cantidad de registros
      language: {
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior',
        },
      },
    });
  }

  // Método para filtrar los productos por fecha
  filterByDate(): void {
    const startDateInput: HTMLInputElement = document.getElementById(
      'startDate'
    ) as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById(
      'endDate'
    ) as HTMLInputElement;

    const startDate = startDateInput.value
      ? new Date(startDateInput.value)
      : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    // Validar que las fechas sean válidas
    if (startDate && endDate && startDate > endDate) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      startDateInput.value = '';
      endDateInput.value = '';
      return;
    }

    this.filteredProductos = this.productos.filter((producto) => {
      const productDate = new Date(this.formatDateyyyyMMdd(producto.date));
      return (
        (!startDate || productDate >= startDate) &&
        (!endDate || productDate <= endDate)
      );
    });

    // Actualizar el DataTable
    if (this.table) {
      this.table.clear().rows.add(this.filteredProductos).draw(); // Actualiza la tabla con los productos filtrados
    }
  }

  formatDateyyyyMMdd(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  // Método que genera el PDF
  exportToPdf(): void {
    // Seleccionar el elemento de la tabla por su ID
    const table = document.getElementById('historialTable') as HTMLTableElement;
    if (table) {
      this.excelPdfService.exportTableToPdf(table, 'reporte_productos'); // Llamada al servicio para generar el PDF
    } else {
      console.error('Tabla no encontrada');
    }
  }

  exportToExcel(): void {
    // Seleccionar el elemento de la tabla por su ID
    const table = document.getElementById('historialTable') as HTMLTableElement;
    if (table) {
      this.excelPdfService.exportTableToExcel(table, 'reporte_productos'); // Llamada al servicio para generar el Excel
    } else {
      console.error('Tabla no encontrada');
    }
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy(); // Destruye la instancia de DataTable al destruir el componente
    }
  }
}
