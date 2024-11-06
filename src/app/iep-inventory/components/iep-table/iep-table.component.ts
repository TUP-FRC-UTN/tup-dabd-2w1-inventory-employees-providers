import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import 'datatables.net';
import 'datatables.net-bs5';
import $ from 'jquery';
import * as XLSX from 'xlsx';
import { GenerateExcelPdfService } from '../../../common-services/generate-excel-pdf.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Producto } from '../../models/producto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-iep-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iep-table.component.html',
  styleUrls: ['./iep-table.component.css'],
})
export class IepTableComponent implements OnInit, AfterViewInit, OnDestroy {

  applyAllFilters(): void {
    if (this.isApplyButtonDisabled) {
      return; // No aplicar filtros si el botón está deshabilitado
    }
  
    this.filteredProductos = this.productos.filter((producto) => {
      // Filtro por tipo de movimiento
      const matchesMovementType = this.selectedMovementTypes.length === 0 || 
        this.selectedMovementTypes.includes(producto.modificationType.toLowerCase());
  
      // Filtro por cantidad
      const amount = producto.amount;
      const matchesAmountFilter =
        (this.minAmount === null || amount >= this.minAmount) &&
        (this.maxAmount === null || amount <= this.maxAmount);
  
      // Filtros por texto
      const matchesProduct = producto['product'].toLowerCase().includes(this.filterValues['product']);
      const matchesSupplier = producto['supplier'].toLowerCase().includes(this.filterValues['supplier']);
      const matchesDescription = producto['description'].toLowerCase().includes(this.filterValues['description']);
      
      // Filtro por fecha
      const productDate = new Date(this.formatDateyyyyMMdd(producto.date));
      const matchesDateFilter =
        (!this.startDate || productDate >= new Date(this.startDate)) &&
        (!this.endDate || productDate <= new Date(this.endDate));
  
      return matchesMovementType &&
        matchesAmountFilter &&
        matchesProduct &&
        matchesSupplier &&
        matchesDescription &&
        matchesDateFilter;
    });
  
    // Actualizar DataTable
    if (this.table) {
      this.table.clear().rows.add(this.filteredProductos).draw();
    }
  }
  

  selectedMovementTypes: string[] = [];
  minAmount: number | null = null;
  maxAmount: number | null = null;
  filterValues: { [key: string]: string } = {
    product: '',
    supplier: '',
    description: ''
  };
  
  // Propiedad para controlar el estado del botón
  isApplyButtonDisabled: boolean = false;

  private table: any; // Referencia para la instancia de DataTable
  productos: Producto[] = []; // Array para almacenar los productos
  filteredProductos: Producto[] = []; // Array para almacenar productos filtrados

  exportButtonsEnabled: boolean = true; // Controla la habilitación de los botones
  private stockMap: Map<string, number> = new Map();

  constructor(
    private productService: ProductService,
    private excelPdfService: GenerateExcelPdfService
  ) { }

  globalFilter: string = ''; // Filtro global para la búsqueda
  
  applyFilter(): void {
    const filterValue = this.globalFilter.toLowerCase(); // Convertir a minúsculas para una comparación insensible
    console.log('Filtro global:', filterValue);
  
    // Filtrar los productos según el valor del input
    this.filteredProductos = this.productos.filter((producto) => {
      return (
        producto.product.toLowerCase().includes(filterValue) || // Filtrar por producto
        producto.modificationType.toLowerCase().includes(filterValue) || // Filtrar por tipo de movimiento
        producto.supplier.toLowerCase().includes(filterValue) || // Filtrar por proveedor
        producto.description.toLowerCase().includes(filterValue) // Filtrar por justificativo
      );
    });
  
    // Filtrar por fecha startDate y endDate (solo una vez)
    this.filteredProductos = this.filteredProductos.filter((producto) => {
      const productDate = new Date(this.formatDateyyyyMMdd(producto.date));
      return (
        (!this.startDate || productDate >= new Date(this.startDate)) &&
        (!this.endDate || productDate <= new Date(this.endDate))
      );
    });
  
    // Actualizar el DataTable con los productos filtrados
    if (this.table) {
      this.table.clear().rows.add(this.filteredProductos).draw();
    }
  }
  

  // Variables necesarias para el filtrado por fecha
  startDate: string | undefined;
  endDate: string | undefined;

  onStartDateChange(): void {
  }

  onEndDateChange(): void {
  }

  ngOnInit(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    this.endDate = hoy.toISOString().split('T')[0];
    // Inicializar la fecha de inicio con la fecha actual menos 30 dias
    hace30Dias.setDate(hoy.getDate() - 30);
    this.startDate = hace30Dias.toISOString().split('T')[0];
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


      // Llama a filterByDate después de establecer los productos
      this.filterByDate(); // Aplica el filtro de fechas inicial

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
      /*       layout: {
              topStart: 'search',
              topEnd: null,
            }, */
      dom:
        '<"mb-3"t>' +                           //Tabla
        '<"d-flex justify-content-between"lp>', //Paginacion
      data: this.filteredProductos, // Usar la lista filtrada
      columns: [
        {
          data: 'date',
          title: 'Fecha',
          render: (data, type, row) => {
            if (type === 'display') {
              return data; // Mantiene el formato dd/MM/yyyy para mostrar
            }
            if (type === 'sort') {
              // Convierte la fecha dd/MM/yyyy a formato sorteable
              const [day, month, year] = data.split('/');
              return `${year}${month}${day}`; // Formato yyyyMMdd para ordenamiento
            }
            return data;
          }
        },
        { data: 'product', title: 'Producto' }, // Columna de producto
        { data: 'modificationType', title: 'Tipo movimiento' }, // Columna de tipo de movimiento
        { data: 'supplier', title: 'Proveedor' }, // Columna de proveedor
        { data: 'amount', title: 'Cantidad' }, // Columna de cantidad
        { data: 'description', title: 'Justificativo' }, // Columna de justificativo
        { data: 'stockAfterModification', title: 'Stock Resultante' },
      ],
      pageLength: 5,
      lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
      lengthMenu: [ // Opciones para el menú desplegable de longitud
        [5, 10, 25, 50], // Valores para el número de filas
        [5, 10, 25, 50] // Etiquetas para el número de filas
      ],
      searching: false, // Desactivar la búsqueda
      order: [[0, 'desc']], // Ordenar por fecha de forma descendente
      language: {
        lengthMenu: '_MENU_', // Esto eliminará el texto "entries per page"
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        emptyTable: 'No se encontraron registros', // Mensaje personalizado si no hay datos        
        paginate: {
          first: '<<',
          last: '>>',
          next: '>',
          previous: '<',
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
      //alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
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

  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${day}-${month}-${year}`;
  }

  // Método que genera el PDF
  exportToPdf(): void {
    if (!this.filteredProductos.length) {
      console.error('No hay datos para exportar');
      return;
    }

    // Crear nuevo documento PDF
    const doc = new jsPDF();

    // Usar los datos ya procesados de filteredProductos
    const tableData = this.filteredProductos.map((producto) => [
      producto.date, // Ya está formateado por calculateRunningStock
      producto.product,
      producto.modificationType,
      producto.supplier,
      producto.amount.toString(),
      producto.description,
      producto.stockAfterModification, // Usamos el stock calculado
    ]);

    const headers = [
      'Fecha',
      'Producto',
      'Tipo Movimiento',
      'Proveedor',
      'Cantidad',
      'Justificativo',
      'Stock Después',
    ];

    // Generar la tabla en el PDF
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'center',
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Fecha
        1: { cellWidth: 25 }, // Producto
        2: { cellWidth: 25 }, // Tipo Movimiento
        3: { cellWidth: 25 }, // Proveedor
        4: { cellWidth: 15, halign: 'right' }, // Cantidad
        5: { cellWidth: 50 }, // Justificativo
        6: { cellWidth: 20, halign: 'right' }, // Stock Después
      },
      margin: { top: 10 },
      didDrawPage: function (data: any) {
        // Agregar número de página
        //const str = 'Página ' + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();
        //doc.text(str, data.settings.margin.left, pageHeight - 10);
      },
    });

    // Guardar el PDF
    const formattedDate = this.getFormattedDate();
    doc.save(`Reporte_Productos_${formattedDate}.pdf`)
  }

  exportToExcel(): void {
    if (!this.filteredProductos.length) {
      console.error('No hay datos para exportar');
      return;
    }

    // Usar los datos ya procesados de filteredProductos
    const data = this.filteredProductos.map((producto) => ({
      Fecha: producto.date, // Ya está formateado por calculateRunningStock
      Producto: producto.product,
      'Tipo Movimiento': producto.modificationType,
      Proveedor: producto.supplier,
      Cantidad: producto.amount,
      Justificativo: producto.description,
      'Stock Después': producto.stockAfterModification, // Usamos el stock calculado
    }));

    // Crear una nueva hoja de trabajo
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Configurar el ancho de las columnas
    const columnsWidth = [
      { wch: 12 }, // Fecha
      { wch: 20 }, // Producto
      { wch: 20 }, // Tipo Movimiento
      { wch: 20 }, // Proveedor
      { wch: 15 }, // Cantidad
      { wch: 30 }, // Justificativo
      { wch: 15 }, // Stock Después
    ];
    worksheet['!cols'] = columnsWidth;

    // Crear un nuevo libro de trabajo y agregar la hoja
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');

    // Guardar el archivo
    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `Reporte_Productos_${formattedDate}.xlsx`);
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy(); // Destruye la instancia de DataTable al destruir el componente
    }
  }


  filtersVisible = true; // Controla la visibilidad de los filtros


  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible; // Alterna la visibilidad de los filtros
    if (this.filtersVisible) {
      this.cleanColumnFilters(); // Limpia los filtros al ocultarlos
    }
  }

  applyAmountFilter(type: 'min' | 'max', event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseFloat(input.value) : null;

    if (type === 'min') {
      this.minAmount = value;
    } else {
      this.maxAmount = value;
    }

    // Validar si el máximo es menor que el mínimo
    this.validateAmountRange();
  }

  validateAmountRange(): void {
    if (this.minAmount !== null && this.maxAmount !== null) {
      this.isApplyButtonDisabled = this.maxAmount < this.minAmount;
    } else {
      this.isApplyButtonDisabled = false;
    }
  }

  applyColumnFilter(event: Event, column: string): void {
    if (column === 'modificationType') {
      const checkbox = event.target as HTMLInputElement;
      const value = checkbox.value.toLowerCase();
      
      if (checkbox.checked) {
        this.selectedMovementTypes.push(value);
      } else {
        const index = this.selectedMovementTypes.indexOf(value);
        if (index > -1) {
          this.selectedMovementTypes.splice(index, 1);
        }
      }
    } else {
      const input = event.target as HTMLInputElement;
      this.filterValues[column] = input.value.toLowerCase();
    }
  }


  cleanColumnFilters(): void {
    //resetar los ngModel de los inputs
    this.globalFilter = '';
    this.startDate = '';
    this.endDate = '';
    // Resetear todos los valores de filtro
    this.minAmount = null;
    this.maxAmount = null;
    this.selectedMovementTypes = [];
    this.filterValues = {
      product: '',
      supplier: '',
      description: ''
    };
    this.isApplyButtonDisabled = false;
  
    // Resetear inputs
    const textInputs = document.querySelectorAll('input.form-control');
    const checkboxInputs = document.querySelectorAll('input[type="checkbox"]');
  
    textInputs.forEach(input => (input as HTMLInputElement).value = '');
    checkboxInputs.forEach(checkbox => (checkbox as HTMLInputElement).checked = false);
  
    // Resetear lista filtrada
    this.filteredProductos = [...this.productos];
  
    // Actualizar DataTable
    if (this.table) {
      this.table.clear().rows.add(this.filteredProductos).draw();
    }
  }
}
