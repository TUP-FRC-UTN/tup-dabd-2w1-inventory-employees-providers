import { Component, inject, OnDestroy, OnInit, AfterViewInit, } from '@angular/core';
import { debounceTime, Observable, Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockAumentoService } from '../../services/stock-aumento.service';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-bs5';
import jsPDF from 'jspdf';
import { IepStockIncreaseComponent } from '../iep-stock-increase/iep-stock-increase.component';
import { Details } from '../../models/details';
import { ProductCategory } from '../../models/product-category';
import { ProductXDetailDto } from '../../models/product-xdetail-dto';
import { CategoriaService } from '../../services/categoria.service';
import { DetailServiceService } from '../../services/detail-service.service';
import { EstadoService } from '../../services/estado.service';

interface Filters {
  categoriasSeleccionadas: number[];
  reutilizableSeleccionado: number[];
  nombre: string;
  startDate: string;
  endDate: string;
  cantMinima: number;
  cantMaxima: number;
}

@Component({
  selector: 'app-iep-inventory',
  standalone: true,
  imports: [FormsModule, CommonModule, IepStockIncreaseComponent],
  templateUrl: './iep-inventory.component.html',
  styleUrl: './iep-inventory.component.css',
})
export class IepInventoryComponent implements OnInit, OnDestroy, AfterViewInit {

    // Objeto que mantiene el estado de todos los filtros
    filters: Filters = {
      categoriasSeleccionadas: [],
      reutilizableSeleccionado: [],
      nombre: '',
      startDate: '',
      endDate: '',
      cantMinima: 0,
      cantMaxima: 0
    };

     // Método principal de filtrado que combina todos los filtros
  aplicarFiltrosCombinados(): void {
    this.productosFiltered = this.productosALL.filter(producto => {
      // Filtro por nombre
      const nombreCumple = !this.filters.nombre || 
        producto.name.toLowerCase().includes(this.filters.nombre.toLowerCase());

      // Filtro por categorías
      const categoriaCumple = this.filters.categoriasSeleccionadas.length === 0 ||
        this.filters.categoriasSeleccionadas.includes(producto.category.categoryId);

      // Filtro por reutilizable
      const reusableCumple = this.filters.reutilizableSeleccionado.length === 0 ||
        this.filters.reutilizableSeleccionado.includes(producto.reusable ? 1 : 2);

      // Filtro por cantidad
      const amount = producto.detailProducts.length;
      const cantMinimaCumple = !this.filters.cantMinima || amount >= this.filters.cantMinima;
      const cantMaximaCumple = !this.filters.cantMaxima || amount <= this.filters.cantMaxima;

      // Filtro por fecha
      let fechaCumple = true;
      if (this.filters.startDate || this.filters.endDate) {
        let lastDate = this.getLastUpdateDate(producto.detailProducts);
        if (!lastDate) {
          fechaCumple = false;
        } else {
          const productDate = new Date(lastDate);
          if (this.filters.startDate) {
            fechaCumple = fechaCumple && productDate >= new Date(this.filters.startDate);
          }
          if (this.filters.endDate) {
            fechaCumple = fechaCumple && productDate <= new Date(this.filters.endDate);
          }
        }
      }

      return nombreCumple && 
             categoriaCumple && 
             reusableCumple && 
             cantMinimaCumple && 
             cantMaximaCumple && 
             fechaCumple;
    });

    this.updateDataTable();
    this.actualizarContadores();
  }

  // Método auxiliar para obtener la última fecha de actualización
  private getLastUpdateDate(detailProducts: any[]): string {
    let lastDate = '';
    for (const detail of detailProducts) {
      if (detail.lastUpdatedDatetime && (!lastDate || detail.lastUpdatedDatetime > lastDate)) {
        lastDate = detail.lastUpdatedDatetime;
      }
    }
    return lastDate;
  }

  // Actualiza los contadores después de aplicar los filtros
  private actualizarContadores(): void {
    this.amountAvailable = this.getCountByategoryAndState(1, 'Disponible');
    this.amountBorrowed = this.getCountByategoryAndState(1, 'Prestado');
    this.amountBroken = this.getCountByategoryAndState(1, 'Roto');
  }

  // Añade esto en las propiedades de la clase
  categoriasSeleccionadas: number[] = [];
  reutilizableSeleccionado: number[] = [];

  // Añade este método para manejar los cambios en los checkboxes
  onCategoriaChange(event: any, categoryId: number): void {
    if (event.target.checked) {
      this.filters.categoriasSeleccionadas.push(categoryId);
    } else {
      this.filters.categoriasSeleccionadas = this.filters.categoriasSeleccionadas
        .filter(id => id !== categoryId);
    }
    this.aplicarFiltrosCombinados();
  }

  onReutilizableChange(event: any, reusable: number): void {
    if (event.target.checked) {
      this.filters.reutilizableSeleccionado.push(reusable);
    } else {
      this.filters.reutilizableSeleccionado = this.filters.reutilizableSeleccionado
        .filter(id => id !== reusable);
    }
    this.aplicarFiltrosCombinados();
  }


  // Variables necesarias para el filtrado por fecha
  startDate: string = '';
  endDate: string = '';

  filtrarPorUltimos30Dias(): void {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.setDate(hoy.getDate() - 30));

    this.productosFiltered = this.productosALL.filter(producto => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (detail.lastUpdatedDatetime && (!lastDate || detail.lastUpdatedDatetime > lastDate)) {
          lastDate = detail.lastUpdatedDatetime;
        }
      }
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);
      return productDate >= hace30Dias;
    });
  }


  onStartDateChange(): void {
    const startDateInput = document.getElementById('startDate') as HTMLInputElement;
    this.filters.startDate = startDateInput.value;
    this.aplicarFiltrosCombinados();
  }

  onEndDateChange(): void {
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;
    this.filters.endDate = endDateInput.value;
    this.aplicarFiltrosCombinados();
  }

  applyDateFilter(): void {
    this.productosFiltered = this.productosALL.filter(producto => {
      // Obtener la última fecha de actualización de los detalles del producto
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (detail.lastUpdatedDatetime) {
          if (!lastDate || detail.lastUpdatedDatetime > lastDate) {
            lastDate = detail.lastUpdatedDatetime;
          }
        }
      }

      // Si no hay fecha de inicio ni fin, mostrar todos los productos
      if (!this.startDate && !this.endDate) {
        return true;
      }

      // Si no hay fecha para el producto, no lo incluimos en el filtro
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);

      // Filtrar por fecha de inicio si existe
      if (this.startDate && !this.endDate) {
        return productDate >= new Date(this.startDate);
      }

      // Filtrar por fecha final si existe
      if (!this.startDate && this.endDate) {
        return productDate <= new Date(this.endDate);
      }

      // Filtrar por rango de fechas si ambas existen
      return productDate >= new Date(this.startDate) && productDate <= new Date(this.endDate);
    });

    this.updateDataTable();
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.productosFiltered = this.productosALL.filter(producto => {
      // Obtener todos los valores de las columnas excepto la primera (fecha)
      const searchableValues = [
        producto.name,
        producto.category?.categoryName,
        producto.reusable ? 'SI' : 'NO',
        producto.detailProducts?.length.toString(),
        producto.minQuantityWarning?.toString()
      ].map(value => value?.toLowerCase() || '');

      // Verificar si alguno de los valores coincide con el texto de búsqueda
      return searchableValues.some(value => value.includes(filterValue));
    });

    this.updateDataTable();
  }

  filtersVisible = false; // Controla la visibilidad de los filtros

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible; // Alterna la visibilidad de los filtros
    if (this.filtersVisible) {
      this.cleanFilters(); // Limpia los filtros al ocultarlos
    }
  }

  private categoriaService = inject(CategoriaService);
  private estadoService = inject(EstadoService);
  private productoService = inject(ProductService);
  private detalleProductoService = inject(DetailServiceService);
  private stockAumentoService = inject(StockAumentoService);
  private router = inject(Router);
  modalVisible: boolean = false;

  categorias$: Observable<ProductCategory[]> = new Observable<
    ProductCategory[]
  >();
  estados$: Observable<String[]> = new Observable<String[]>();

  productos$: Observable<ProductXDetailDto[]> = new Observable<
    ProductXDetailDto[]
  >();
  productosALL: any[] = [];
  productosFiltered: any[] = [];

  categoriasSubscription: Subscription | undefined;
  estadosSubscription: Subscription | undefined;
  productosSubscription: Subscription | undefined;

  categories: ProductCategory[] = [];
  estados: String[] = [];
  productos: ProductXDetailDto[] = [];
  details: Details[] = [];

  amountAvailable: number = 0;
  amountBorrowed: number = 0;
  amountBroken: number = 0;

  categoria: number = 0;
  reusable: number = 0;
  cantMinima: number = 0;
  cantMaxima: number = 0;
  nombre: string = '';

  requestInProcess: boolean = false;

  myMap: Record<string, number> = {
    Disponible: 0,
    Prestado: 0,
    Roto: 0,
  };
  private table: any;

  validoMin: boolean = true;
  validoMax: boolean = true;
  mensajeValidacionMin: string = '';
  mensajeValidacionMax: string = '';

  valAmount: boolean = false;
  showAumentoStockModal: boolean = false;
  showNuevoProductoModal: boolean = false;
  selectedProductId: number | null = null;

  ngOnInit(): void {
    this.endDate = new Date().toISOString().split('T')[0];
    // Inicializar la fecha de inicio con la fecha actual menos 30 dias
    this.startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    this.initializeDataTable();
    this.cargarDatos();
    this.cargarProductos();
  }

  ngAfterViewInit(): void { }

  cargarProductos() {
    this.requestInProcess = true;
    this.productos$ = this.productoService.getAllProducts();
    this.productos$.subscribe({
      next: (productos) => {
        this.productosALL = productos;
        this.filtrarPorUltimos30Dias(); // Aplica el filtro automáticamente
        this.updateDataTable(); // Actualiza la tabla con el filtro aplicado
        this.requestInProcess = false;
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      },
    });
  }

  cargarDatos() {
    this.categorias$ = this.categoriaService.getCategorias();
    this.categorias$.subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log(this.categories);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      },
    });
    this.estados$ = this.estadoService.getEstados();
    this.estados$.subscribe({
      next: (estados) => {
        this.estados = estados;
        console.log('ESTADOS' + this.estados);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      },
    });
  }

  // Modifica el método aplicarFiltros() para usar las categorías seleccionadas
  aplicarFiltros(): void {
    this.productosFiltered = this.productosALL.filter((producto) => {
      const nombreCumple =
        this.nombre === '' ||
        producto.name.toLowerCase().includes(this.nombre.toLowerCase());

      // Lógica para múltiples categorías
      const categoriaCumple =
        this.categoriasSeleccionadas.length === 0 ||
        this.categoriasSeleccionadas.includes(producto.category.categoryId);

      // Lógica para reutilizable (SI, NO, Ambos, Ninguno)
      const reusableCumple =
        this.reutilizableSeleccionado.length === 0 ||
        this.reutilizableSeleccionado.includes(producto.reusable ? 1 : 2);


      /*     let reusableCumple = false;
          if (producto.reusable && this.reusable === 1) {
            reusableCumple = true;
          } else if (!producto.reusable && this.reusable === 2) {
            reusableCumple = true;
          } else if (this.reusable === 0) {
            reusableCumple = true;
          } */

      const amount = producto.detailProducts.length;
      const minQuantityWarningCumple = this.cantMinima === 0 || amount >= this.cantMinima;
      const maxQuantityWarningCumple = this.cantMaxima === 0 || amount <= this.cantMaxima;

      return (
        nombreCumple &&
        categoriaCumple &&
        reusableCumple &&
        minQuantityWarningCumple &&
        maxQuantityWarningCumple
      );
    });

    this.amountAvailable = this.getCountByategoryAndState(1, 'Disponible');
    this.amountBorrowed = this.getCountByategoryAndState(1, 'Prestado');
    this.amountBroken = this.getCountByategoryAndState(1, 'Roto');
    this.updateDataTable();
  }

  // Modifica el método cleanFilters() para limpiar también las categorías seleccionadas
  cleanFilters(): void {
    this.filters = {
      categoriasSeleccionadas: [],
      reutilizableSeleccionado: [],
      nombre: '',
      startDate: '',
      endDate: '',
      cantMinima: 0,
      cantMaxima: 0
    };

    // Limpia los checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => checkbox.checked = false);

    // Limpia los campos de texto
    const textInputs = document.querySelectorAll('input.form-control');
    textInputs.forEach(input => (input as HTMLInputElement).value = '');

    this.aplicarFiltrosCombinados();
  }

  getCountByategoryAndState(categoryId: number, state: string): number {
    return this.productosFiltered.reduce((count, producto) => {
      if (producto.category.categoryId === categoryId) {
        for (let i = 0; i < producto.detailProducts.length; i++) {
          if (producto.detailProducts[i].state === state) {
            count++;
          }
        }
      }
      return count;
    }, 0);
  }

  initializeDataTable(): void {
    this.table = $('#productsList').DataTable({
      dom:
        '<"mb-3"t>' +
        '<"d-flex justify-content-between"lp>',
      data: this.productosFiltered,
      columns: [
        {
          data: 'detailProducts',
          title: 'Último ingreso', // Título más corto
          render: (data: any) => {
            let lastDate;
            for (let i = 0; i < data.length; i++) {
              if (data[i].lastUpdatedDatetime) {
                lastDate = data[i].lastUpdatedDatetime;
                if (data[i].lastUpdatedDatetime > lastDate) {
                  lastDate = data[i].lastUpdatedDatetime;
                }
              }
            }
            return lastDate ? this.formatDate(lastDate) : '';
          },
        },
        { data: 'name', title: 'Nombre' }, // Mantiene el título corto
        {
          data: 'category',
          title: 'Categoría',
          render: (data: any) => {
            return data.categoryName;
          },
        },
        {
          data: 'reusable',
          title: 'Reutilizable',
          render: (data: boolean) => (data ? 'SI' : 'NO'),
        },
        {
          data: 'detailProducts',
          title: 'Cantidad',
          render: (data: any) => {
            return data.length;
          },
        },
        {
          data: 'minQuantityWarning',
          title: 'Min. Alerta',
        },
        {
          data: null,
          title: 'Acciones',
          render: (data: any, type: any, row: any) => {
            return `
              <div class="dropdown">
                <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" 
                   style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                  &#8942;
                </a>
                <ul class="dropdown-menu">
                  <li><button class="dropdown-item btn botonAumentoStock" data-id="${row.id}">Agregar</button></li>
                  <li><button class="dropdown-item btn botonDetalleConsultar" data-id="${row.id}">Ver más</button></li>
                </ul>
              </div>
            `;
          },
        },
      ],
      pageLength: 10,
      lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
      lengthMenu: [10, 25, 50], // Valores para el número de filas],
      searching: false,
      ordering: true,
      order: [[0, 'asc']],
      autoWidth: false, // Desactivar el ajuste automático de ancho

      language: {
        search: '',
        lengthMenu: '_MENU_', // Esto eliminará el texto "entries per page"
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        emptyTable: 'No se encontraron registros',
        paginate: {
          first: '<<',
          last: '>>',
          next: '>',
          previous: '<',
        },
      },
      initComplete: () => {
        $('#Nombre').on('keyup', (event) => {
          this.nombre = $(event.currentTarget).val() as string;
          if (this.table.search() !== this.nombre) {
            this.table.search(this.nombre).draw();
          }
        });
      },
    });
    // Corregir los event handlers
    $('#productsList').on('click', '.botonAumentoStock', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = $(event.currentTarget).data('id');
      this.abrirModalAumentoStock(id);
    });

    $('#productsList').on('click', '.botonDetalleConsultar', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = $(event.currentTarget).data('id');
      this.irDetalles(id);
    });

    $('#productsList').on('click', '.botonDetalleCrear', (event) => {
      const id = $(event.currentTarget).data('id');
      this.irAgregarDetalles(id);
    });

  }

  /* METODO PARA PASAR DE FECHAS "2024-10-17" A FORMATO dd/mm/yyyy*/
  formatDate(inputDate: string): string {
    const [year, month, day] = inputDate.split('-');
    return `${day}/${month}/${year}`;
  }

  updateDataTable(): void {
    if (this.table) {
      this.table.clear().rows.add(this.productosFiltered).draw();
    }
  }


  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  }

  generarPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Productos', 10, 10);

    // Reordenamos los datos según el orden de columnas en la tabla HTML
    const dataToExport = this.productosFiltered.map((producto) => [
      producto.detailProducts
        ? this.getLastIngreso(producto.detailProducts)
        : '', // Último ingreso
      producto.name, // Nombre
      producto.category ? producto.category.categoryName : '', // Categoría
      producto.reusable ? 'SI' : 'NO', // Reutilizable
      producto.detailProducts ? producto.detailProducts.length : 0, // Cantidad
      producto.minQuantityWarning || '', // Min. Alerta
    ]);

    // Orden de encabezados de columnas según la tabla HTML
    (doc as any).autoTable({
      head: [
        [
          'Último ingreso',
          'Nombre',
          'Categoría',
          'Reutilizable',
          'Cantidad',
          'Min. Alerta',
        ],
      ],
      body: dataToExport,
      startY: 20,
    });

    // Guardar archivo PDF
    const formattedDate = this.getFormattedDate();
    doc.save(`Lista_Productos_${formattedDate}.pdf`);
  }

  // Método auxiliar para obtener la última fecha de ingreso
  getLastIngreso(detailProducts: any[]): string {
    let lastDate = '';
    for (let i = 0; i < detailProducts.length; i++) {
      if (detailProducts[i].lastUpdatedDatetime) {
        if (!lastDate || detailProducts[i].lastUpdatedDatetime > lastDate) {
          lastDate = detailProducts[i].lastUpdatedDatetime;
        }
      }
    }
    return lastDate ? this.formatDate(lastDate) : '';
  }

  generarExcel(): void {
    // Reordenamos los datos según el orden de columnas en la tabla HTML
    const dataToExport = this.productosFiltered.map((producto) => ({
      'Último ingreso': producto.detailProducts
        ? this.getLastIngreso(producto.detailProducts)
        : '',
      Nombre: producto.name,
      Categoría: producto.category ? producto.category.categoryName : '',
      Reutilizable: producto.reusable ? 'SI' : 'NO',
      Cantidad: producto.detailProducts ? producto.detailProducts.length : 0,
      'Min. Alerta': producto.minQuantityWarning || '',
    }));

    // Crear hoja y libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Productos');

    // Guardar archivo Excel
    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `Lista_Productos_${formattedDate}.xlsx`);
  }

  irMenu() {
    this.router.navigate(['']);
  }

  irDetalles(id: number) {
    this.detalleProductoService.setId(id);
    this.router.navigate(['home/inventory-detail']);
  }



  irAgregarProducto() {
    /* this.modalVisible = true; // Muestra el modal */
    this.router.navigate(["home/new-product"])
  }

  verificarMin() {
    if (this.cantMinima < 0) {
      this.mensajeValidacionMin = 'El número no puede ser menor a cero';
      return false;
    }
    if (this.cantMinima > this.cantMaxima) {
      if (this.cantMaxima !== 0 && this.cantMaxima !== null) {
        this.mensajeValidacionMin =
          'La cantidad minima no puede ser mayor a la cantidad maxima';
        return false;
      }
    }

    this.mensajeValidacionMin = '';
    return true;
  }

  verificarMax() {
    if (this.cantMaxima < 0) {
      this.mensajeValidacionMax = 'No puedes poner un numero menor a cero';
      return false;
    }

    this.mensajeValidacionMax = '';
    return true;
  }



  ngOnDestroy(): void {
    if (this.categoriasSubscription) {
      this.categoriasSubscription.unsubscribe();
    }
    if (this.estadosSubscription) {
      this.estadosSubscription.unsubscribe();
    }
    if (this.productosSubscription) {
      this.productosSubscription.unsubscribe();
    }
    this.showAumentoStockModal = false;
    this.selectedProductId = null;
  }

  // Agregar método para recargar la tabla después de aumentar el stock
  recargarDespuesDeAumentoStock() {
    this.cargarProductos();
    this.cerrarModalAumentoStock();
  }

  abrirModalAumentoStock(productId: number) {
    this.selectedProductId = productId;
    this.showAumentoStockModal = true;
    this.modalVisible = false; // Asegurarse que el otro modal esté cerrado
    this.stockAumentoService.setId(productId);
  }

  cerrarModalAumentoStock() {
    this.showAumentoStockModal = false;
    this.selectedProductId = null;
  }

  abrirModal() {
    this.modalVisible = true;
    this.showAumentoStockModal = false; // Asegurarse que el otro modal esté cerrado
  }

  cerrarModal() {
    this.modalVisible = false;
  }

  handleModalBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      if (this.showAumentoStockModal) {
        this.cerrarModalAumentoStock();
      }
      if (this.modalVisible) {
        this.cerrarModal();
      }
    }
  }

  irAgregarDetalles(id: number) {
    this.stockAumentoService.setId(id);
    this.abrirModalAumentoStock(id);
  }
}
