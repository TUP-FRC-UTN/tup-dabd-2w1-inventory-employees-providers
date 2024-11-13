import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  AfterViewInit,
  NgModule,
} from '@angular/core';
import { debounceTime, min, Observable, Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { StockAumentoService } from '../../services/stock-aumento.service';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-bs5';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { IepStockIncreaseComponent } from '../iep-stock-increase/iep-stock-increase.component';
import { Details } from '../../models/details';
import { ProductCategory } from '../../models/product-category';
import {
  ProductXDetailDto,
  ProductXDetailDto2,
} from '../../models/product-xdetail-dto';
import { CategoriaService } from '../../services/categoria.service';
import { DetailServiceService } from '../../services/detail-service.service';
import { EstadoService } from '../../services/estado.service';
import { Row } from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
declare var bootstrap: any; // Añadir esta declaración al principio
// Interfaces existentes actualizadas
interface Filters {
  categoriasSeleccionadas: number[];
  reutilizableSeleccionado: number[];
  nombre: string;
  startDate: string;
  endDate: string;
  cantMinima: number;
  cantMaxima: number;
}

// Nuevas interfaces para ng-select
interface CategoryOption {
  value: number;
  name: string;
}

interface ReusableOption {
  value: number;
  name: string;
}

@Component({
  selector: 'app-iep-inventory',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    IepStockIncreaseComponent,
    NgSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './iep-inventory.component.html',
  styleUrl: './iep-inventory.component.css',
})
export class IepInventoryComponent implements OnInit, OnDestroy, AfterViewInit {
  errorMessage: string = '';
  // Objeto que mantiene el estado de todos los filtros
  filters: Filters = {
    categoriasSeleccionadas: [],
    reutilizableSeleccionado: [],
    nombre: '',
    startDate: '',
    endDate: '',
    cantMinima: 0,
    cantMaxima: 0,
  };

  dateStartFilter= new FormControl();
  dateEndFilter= new FormControl();

  productoSeleccionado: ProductXDetailDto2 | null = null;
  estadoFilter = new FormControl();
  reutilizableFilter = new FormControl();
  
  estadosCombo = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'descontinuado', label: 'Descontinuado' },
  ];

  reutilizablesCombo = [
    { value: true, label: 'Sí' },
    { value: false, label: 'No' },
  ];

  botonDeshabilitado: boolean = false;

  categoryOptions: CategoryOption[] = [];
  selectedCategories: CategoryOption[] = [];

  reusableOptions: ReusableOption[] = [
    { value: 1, name: 'Sí' },
    { value: 2, name: 'No' },
  ];
  selectedReusables: ReusableOption[] = [];

  validarCantidades(): void {
    if (this.cantMinima !== null && this.cantMaxima !== null) {
      this.validoMin = this.cantMinima <= this.cantMaxima;
      this.validoMax = this.cantMaxima >= this.cantMinima;

      // Bloquear el botón si alguno de los valores es inválido
      this.botonDeshabilitado = !(this.validoMin && this.validoMax);
    } else {
      // Si alguno de los dos valores es nulo, no mostrar mensajes de error
      this.validoMin = true;
      this.validoMax = true;
    }
    this.aplicarFiltrosCompletos();
  }

  aplicarFiltrosCompletos(): void {
    // Recoger valores de los inputs
    const nombreInput = document.getElementById('Nombre') as HTMLInputElement;
    if (nombreInput) {
      this.filters.nombre = nombreInput.value;
    }

    const cantMinimaInput = document.getElementById(
      'CantMinima'
    ) as HTMLInputElement;
    if (cantMinimaInput) {
      this.filters.cantMinima = Number(cantMinimaInput.value) || 0;
    }

    const cantMaximaInput = document.getElementById(
      'CantMaxima'
    ) as HTMLInputElement;
    if (cantMaximaInput) {
      this.filters.cantMaxima = Number(cantMaximaInput.value) || 0;
    }

    // Validar cantidades
    this.validoMin = true;
    this.validoMax = true;

    if (this.filters.cantMinima < 0) {
      this.validoMin = false;
      this.mensajeValidacionMin = 'El número no puede ser menor a cero';
      return;
    }

    if (this.filters.cantMaxima < 0) {
      this.validoMax = false;
      this.mensajeValidacionMax = 'No puedes poner un número menor a cero';
      return;
    }

    if (
      this.filters.cantMinima > this.filters.cantMaxima &&
      this.filters.cantMaxima !== 0
    ) {
      this.validoMin = false;
      this.mensajeValidacionMin =
        'La cantidad mínima no puede ser mayor a la cantidad máxima';
      return;
    }

    // Aplicar todos los filtros
    this.productosFiltered = this.productosALL.filter((producto) => {
      // Filtro por nombre
      const nombreCumple =
        !this.filters.nombre ||
        producto.name.toLowerCase().includes(this.filters.nombre.toLowerCase());

      // Filtro por categorías
      const categoriaCumple =
        this.filters.categoriasSeleccionadas.length === 0 ||
        this.filters.categoriasSeleccionadas.includes(
          producto.category.categoryId
        );

      // Filtro por reutilizable
      const reusableCumple =
        this.filters.reutilizableSeleccionado.length === 0 ||
        this.filters.reutilizableSeleccionado.includes(
          producto.reusable ? 1 : 2
        );

      // Filtro por cantidad
      const amount = producto.detailProducts.length;
      const cantMinimaCumple =
        !this.filters.cantMinima || amount >= this.filters.cantMinima;
      const cantMaximaCumple =
        !this.filters.cantMaxima || amount <= this.filters.cantMaxima;


      return (
        nombreCumple &&
        categoriaCumple &&
        reusableCumple &&
        cantMinimaCumple &&
        cantMaximaCumple
      );
    });

    // Actualizar la tabla y los contadores
    this.updateDataTable();
    this.actualizarContadores();
  }

  // Método principal de filtrado que combina todos los filtros
  aplicarFiltrosCombinados(): void {
    this.productosFiltered = this.productosALL.filter((producto) => {
      // Filtro por nombre
      const nombreCumple =
        !this.filters.nombre ||
        producto.name.toLowerCase().includes(this.filters.nombre.toLowerCase());

      // Filtro por categorías
      const categoriaCumple =
        this.filters.categoriasSeleccionadas.length === 0 ||
        this.filters.categoriasSeleccionadas.includes(
          producto.category.categoryId
        );

      // Filtro por reutilizable
      const reusableCumple =
        this.filters.reutilizableSeleccionado.length === 0 ||
        this.filters.reutilizableSeleccionado.includes(
          producto.reusable ? 1 : 2
        );

      // Filtro por cantidad
      const amount = producto.detailProducts.length;
      const cantMinimaCumple =
        !this.filters.cantMinima || amount >= this.filters.cantMinima;
      const cantMaximaCumple =
        !this.filters.cantMaxima || amount <= this.filters.cantMaxima;

      // Filtro por fecha
      let fechaCumple = true;

      return (
        nombreCumple &&
        categoriaCumple &&
        reusableCumple &&
        cantMinimaCumple &&
        cantMaximaCumple &&
        fechaCumple
      );
    });

    this.updateDataTable();
    this.actualizarContadores();
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
  /*   onCategoriaChange(event: any, categoryId: number): void {
    if (event.target.checked) {
      this.filters.categoriasSeleccionadas.push(categoryId);
    } else {
      this.filters.categoriasSeleccionadas = this.filters.categoriasSeleccionadas
        .filter(id => id !== categoryId);
    }
  }

  onReutilizableChange(event: any, reusable: number): void {
    if (event.target.checked) {
      this.filters.reutilizableSeleccionado.push(reusable);
    } else {
      this.filters.reutilizableSeleccionado = this.filters.reutilizableSeleccionado
        .filter(id => id !== reusable);
    }
  }
 */

  filtrarPorUltimos30Dias(): void {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.setDate(hoy.getDate() - 30));

    this.productosFiltered = this.productosALL.filter((producto) => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (
          detail.lastUpdatedDatetime &&
          (!lastDate || detail.lastUpdatedDatetime > lastDate)
        ) {
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

  goTo(path: string) {
    this.router.navigate([path]);
  }

  //Filtra los productos cuya fecha es mayor a startDate
  onStartDateChange(): void {
    this.productosFiltered = this.productosALL.filter((producto) => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (
          detail.lastUpdatedDatetime &&
          (!lastDate || detail.lastUpdatedDatetime > lastDate)
        ) {
          lastDate = detail.lastUpdatedDatetime;
        }
      }
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);
      return this.startDate ? productDate >= new Date(this.startDate) : true;
    });

    this.updateDataTable();
  }

  //Filtra los productos cuya fecha es menor a startDate
  onEndDateChange(): void {
    this.productosFiltered = this.productosALL.filter((producto) => {
      let lastDate = '';
      for (const detail of producto.detailProducts) {
        if (
          detail.lastUpdatedDatetime &&
          (!lastDate || detail.lastUpdatedDatetime > lastDate)
        ) {
          lastDate = detail.lastUpdatedDatetime;
        }
      }
      if (!lastDate) {
        return false;
      }

      const productDate = new Date(lastDate);
      return this.endDate ? productDate <= new Date(this.endDate) : true;
    });

    this.updateDataTable();
  }


  
  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }


  applyDateFilter(): void {
    this.productosFiltered = this.productosALL.filter((producto) => {
      const startDate = this.dateStartFilter.value;
      const endDate = this.dateEndFilter.value;
      try {
        const dateProduct = this.parseDate(this.formatFullDate(producto.lastEntry));
        
        const start = this.parseDate(this.formatDate(startDate));
        const end = this.parseDate(this.formatDate(endDate));

        // Establecer las horas de inicio y fin para comparación correcta
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Comparar las fechas
        return dateProduct >= start && dateProduct <= end;
      } catch (error) {
        console.error('Error al procesar fecha:', error);
        return false;
      }
    });
    this.updateDataTable();
  }

  filtersValues: any = {
    startDate: '',
    endDate: '',
  };

  globalFilter: string = '';

  //Método para filtrar productos con estado Activo e Inactivo
  stateFilter(event: Event) {}

 // Método para aplicar el filtro global y filtros adicionales
applyFilter(): void {
  const globalFilterLower = this.filters.nombre.toLowerCase();
  const startDate = this.dateStartFilter.value;
  const endDate = this.dateEndFilter.value;

  this.productosFiltered = this.productosALL.filter((producto) => {
    // Filtro global: buscar en nombre del producto y nombre de la categoría
    const matchesGlobalFilter =
      producto.name.toLowerCase().includes(globalFilterLower) ||
      producto.category.categoryName.toLowerCase().includes(globalFilterLower);

    // Filtrar por estados seleccionados
    const selectedEstados = this.estadoFilter.value || [];
    const productoEstado = producto.discontinued
      ? 'descontinuado'
      : producto.stock > 0
      ? 'activo'
      : 'inactivo';
    const matchesEstado = 
      selectedEstados.length === 0 || 
      selectedEstados.includes(productoEstado);

    // Filtrar por reutilizable
    const selectedReutilizables = this.reutilizableFilter.value || [];
    const matchesReutilizable = 
      selectedReutilizables.length === 0 || 
      selectedReutilizables.includes(producto.reusable);

    // Filtrado por cantidad
    const matchesCantidad =
      (this.filters.cantMinima ? producto.stock >= this.filters.cantMinima : true) &&
      (this.filters.cantMaxima ? producto.stock <= this.filters.cantMaxima : true);

    // Filtrado por fechas
    let matchesFechas = true;
    if (startDate || endDate) {
      try {
        // Convertir la fecha del producto
        const dateProduct = this.parseDate(this.formatFullDate(producto.lastEntry));
        
        // Establecer fechas de inicio y fin
        const start = startDate ? this.parseDate(this.formatDate(startDate)) : null;
        const end = endDate ? this.parseDate(this.formatDate(endDate)) : null;

        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        matchesFechas = (!start || dateProduct >= start) && (!end || dateProduct <= end);
      } catch (error) {
        console.error('Error al procesar fecha:', error);
        matchesFechas = false;
      }
    }

    // Retornar la combinación de todos los filtros
    return (
      matchesGlobalFilter &&
      matchesReutilizable &&
      matchesEstado &&
      matchesCantidad &&
      matchesFechas
    );
  });

  // Actualizar la tabla si es necesario
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

  constructor() {
    this.estadoFilter.valueChanges.subscribe(() => this.applyFilter());
    this.reutilizableFilter.valueChanges.subscribe(() => this.applyFilter());
  }

  categorias$: Observable<ProductCategory[]> = new Observable<
    ProductCategory[]
  >();
  estados$: Observable<String[]> = new Observable<String[]>();

  productos$: Observable<ProductXDetailDto[]> = new Observable<
    ProductXDetailDto[]
  >();
  productos2$: Observable<ProductXDetailDto2[]> = new Observable<
    ProductXDetailDto2[]
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
  cantMinima: number | null = null;
  cantMaxima: number | null = null;
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

  // Variables necesarias para el filtrado por fecha
  startDate: string | undefined;
  endDate: string | undefined;

  ngOnInit(): void {
    // Mantener la inicialización de fechas existente
    const hoy = new Date();
    const hace30Dias = new Date();
    this.endDate = hoy.toISOString().split('T')[0];
    hace30Dias.setDate(hoy.getDate() - 30);
    this.startDate = hace30Dias.toISOString().split('T')[0];

    // Inicializar opciones para ng-select
    this.initializeNgSelectOptions();

    // Mantener las inicializaciones existentes
    this.cargarDatos();
    this.cargarProductos();
    this.initializeDataTable();
    //ng select
  }

  private initializeNgSelectOptions(): void {
    // Transformar categorías al formato requerido por ng-select cuando estén disponibles
    this.categoriaService.getCategorias().subscribe((categories) => {
      this.categoryOptions = categories.map((c) => ({
        value: c.id,
        name: c.category,
      }));
    });
  }

  onCategoryChange(): void {
    this.filters.categoriasSeleccionadas = this.selectedCategories.map(
      (cat) => cat.value
    );
    this.aplicarFiltrosCombinados();
  }

  onReusableChange(): void {
    this.filters.reutilizableSeleccionado = this.selectedReusables.map(
      (r) => r.value
    );
    this.aplicarFiltrosCombinados();
  }

  ngAfterViewInit(): void {}

  cargarProductos() {
    this.requestInProcess = true;
    this.productos2$ = this.productoService.getProducts2();
    this.productos2$.subscribe({
      next: (productos) => {
        //console.log("productos"+JSON.stringify(productos));
        this.productosALL = productos;
        this.productosFiltered = productos;
        console.log(this.productosFiltered);
        //this.filtrarPorUltimos30Dias(); // Aplica el filtro automáticamente
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

      const categoriaCumple =
        this.categoriasSeleccionadas.length === 0 ||
        this.categoriasSeleccionadas.includes(producto.category.categoryId);

      const reusableCumple =
        this.reutilizableSeleccionado.length === 0 ||
        this.reutilizableSeleccionado.includes(producto.reusable ? 1 : 2);

      const amount = producto.detailProducts.length;
      const minQuantityWarningCumple =
        this.cantMinima === null || amount >= this.cantMinima;
      const maxQuantityWarningCumple =
        this.cantMaxima === null || amount <= this.cantMaxima;

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
    this.cantMaxima = null;
    this.cantMinima = null;
    this.globalFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.estadoFilter.setValue([]);
    this.reutilizableFilter.setValue([]);
    this.filters = {
      categoriasSeleccionadas: [],
      reutilizableSeleccionado: [],
      nombre: '',
      startDate: '',
      endDate: '',
      cantMinima: 0,
      cantMaxima: 0,
    };

    // Limpia los checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => (checkbox.checked = false));

    // Limpia los campos de texto
    const textInputs = document.querySelectorAll('input.form-control');
    textInputs.forEach((input) => ((input as HTMLInputElement).value = ''));

    this.productosFiltered = this.productosALL;
    this.updateDataTable();
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

  formatFullDate(inputDate: string): string {
    const [year, month, day, hour, minute, second, millisecond] = inputDate;
            const dateString = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
            return dateString;
  }

  initializeDataTable(): void {
    this.table = $('#productsList').DataTable({
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',
      data: this.productosFiltered,
      columns: [
        {
          data: 'lastEntry',
          title: 'Último ingreso',
          render: (data:any) => {
            const [year, month, day, hour, minute, second, millisecond] = data;
            const dateString = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
            return dateString;
          }
        },
        {
          data: null,
          title: 'Estado',
          render: (data: any) => {
            const discontinued = data.discontinued;
            const isActive = data.stock > 0;
            const badgeClass = discontinued ? 'bg-danger' : isActive ? 'bg-success' : 'bg-warning text-dark';
            //const badgeClass = isActive ? 'bg-success' : 'bg-danger';
            //const status = isActive ? 'Activo' : 'Inactivo';
            const status = discontinued ? 'Descontinuado' : isActive ? 'Activo' : 'Inactivo';
            return `<div class="text-center">
                    <span class="badge ${badgeClass}">${status}</span>
                    </div>`;
          },
        },
        {
          data: 'reusable',
          title: 'Reutilizable',
          className: 'text-center',
          render: (data: boolean) => {
            let color = data ? 'text-bg-primary' : 'text-bg-warning';
            let name = data ? 'Si' : 'No';

            return `
            <div class="text-center">
              <div class="badge border rounded-pill ${color}">${name}</div>
            </div>`;
          },
        },
        {
          data: 'name',
          title: 'Artículo',
        },
        {
          data: 'category',
          title: 'Categoría',
          render: (data: any) => {
            return data.categoryName;
          },
        },
        {
          data: 'stock',
          title: 'Stock',
          className: 'text-end',
          render: (data: number, type: any, row: any) => {
            const stock = data;
            const warning = row.minQuantityWarning;

            if (stock <= warning) {
              return `<span  font-weight: bold;">${stock}</span>`;
            } else if (stock <= warning + 5) {
              return `<span font-weight: bold;">${stock}</span>`;
            }
            return stock;
          },
        },
        {
          data: 'minQuantityWarning',
          title: 'Min. Alerta',
        },
        {
          data: null,
          title: 'Acciones',
          className: 'align-middle',
          render: (data: any, type: any, row: any) => {
            // Determinamos el estado del producto
            const discontinued = row.discontinued;
            const isActive = row.stock > 0;
            const status = discontinued ? 'Discontinuado' : isActive ? 'Activo' : 'Inactivo';
            
            // El botón eliminar solo estará habilitado cuando el estado sea 'Inactivo'
            const isDeleteDisabled = status !== 'Inactivo';
            const deleteButtonClass = isDeleteDisabled ? 'dropdown-item btn delete-btn disabled text-muted' : 'dropdown-item btn delete-btn';
            
            // Mensaje personalizado según el estado
            const disabledMessage = status === 'Activo' ? 
              'No se puede eliminar un producto activo' : 
              'No se puede eliminar un producto discontinuado';
        
            return `
            <div class="text-center">
              <div class="btn-group">
                <div class="dropdown">
                  <button type="button" class="btn border border-2 bi-three-dots-vertical btn-cambiar-estado" data-bs-toggle="dropdown"></button>
                    <ul class="dropdown-menu">
                      <li><button class="dropdown-item btn botonDetalleEditar" data-id="${row.id}">Editar</button>
                      <li><button class="${deleteButtonClass}" data-id="${row.id}" 
                        ${isDeleteDisabled ? `disabled title="${disabledMessage}"` : ''}
                        (click)="giveLogicalLow(${row.id})" data-bs-target="#eliminarProductoModal" 
                            data-bs-toggle="modal">Eliminar</button>
                      </li>
                    </ul>
                </div>
              </div>
            </div>`;
          },
        },
      ],
      pageLength: 5,
      lengthChange: true,
      lengthMenu: [5, 10, 25, 50],
      searching: false,
      ordering: true,
      order: [[0, 'desc'],[1, 'desc']],
      autoWidth: false,
      language: {
        search: '',
        lengthMenu: '_MENU_',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        emptyTable: 'No se encontraron registros',
      },
      createdRow: function (row: any, data: any) {
        if (data.stock <= data.minQuantityWarning) {
          $(row);
        }
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

    // Event handlers
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

    $('#productsList').on('click', '.botonDetalleEditar', (event) => {
      const id = $(event.currentTarget).data('id');
      this.router.navigate(['/home/product-update/' + id]);
    });

    $('#productsList').on('click', '.delete-btn', (event) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('id');
      this.setProductToDelete(id);
      //this.showConfirmDeleteModal();
    });
  }

  setProductToDelete(id: number): void {
    console.log('Eliminando producto con id: ' + id);
    this.selectedProductId = id;
  }


  showErrorDeleteModal(): void {
    Swal.fire({
      title: 'Error al eliminar el producto',
      text: 'No se pudo eliminar el producto',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    });
  }

  showSuccessDeleteModal(): void {
    Swal.fire({
      title: 'Producto eliminado',
      text: 'El producto ha sido eliminado correctamente',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    });
  }

  deleteProduct(): void {
    console.log('Eliminando producto');
    if (this.selectedProductId !== null) {
      const logicalLow$ = this.productoService.giveLogicalLow(
        this.selectedProductId
      );
      logicalLow$.subscribe({
        next: (response) => {
          console.log(response);
          this.showSuccessDeleteModal();
          this.cargarProductos();
        },
        error: (error) => {
          this.handleErrorMessage(error);
          console.error(error);
        },
        complete: () => {
          console.log('Petición completada');
        },
      });
    } else {
      console.log('No se ha seleccionado un producto');
      this.showErrorDeleteModal();
    }
  }

  handleErrorMessage(error: any): void {
    console.error(error);
    if (error.error.message === '404 Product not found') {
      this.errorMessage = 'El producto no fue encontrado';
    }
    this.showErrorDeleteModal();
  }

  giveLogicalLow(id: number) {
    console.log('Eliminando producto con id: ' + id);
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
      producto.discontinued ? 'Descontinuado' : producto.stock > 0 ? 'Activo' : 'Inactivo', // Estado
      producto.reusable ? 'Sí' : 'No', // Reutilizable
      producto.name, // Artículo
      producto.category ? producto.category.categoryName : '', // Categoría
      producto.stock, // Stock
      producto.minQuantityWarning || '', // Min. Alerta
    ]);
  
    // Orden de encabezados de columnas según la tabla HTML
    (doc as any).autoTable({
      head: [
        [
          'Estado',       // Estado
          'Reutilizable', // Reutilizable
          'Artículo',     // Artículo
          'Categoría',    // Categoría
          'Stock',        // Stock
          'Min. Alerta',  // Min. Alerta
        ],
      ],
      body: dataToExport,
      startY: 30,
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
    });
  
    // Guardar archivo PDF
    const formattedDate = this.getFormattedDate();
    doc.save(`${formattedDate}_Lista_Productos.pdf`);
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
    const encabezado = [
      ['Listado de Productos'],
      [],
      [
        'Estado',        
        'Reutilizable', 
        'Artículo',     
        'Categoría',     
        'Stock',        
        'Min. Alerta',   
      ],
    ];
  
    // Reordenamos los datos según el orden de columnas en la tabla HTML
    const excelData = this.productosFiltered.map((producto) => [
      producto.discontinued ? 'Descontinuado' : producto.stock > 0 ? 'Activo' : 'Inactivo', 
      producto.reusable ? 'Sí' : 'No', 
      producto.name, 
      producto.category ? producto.category.categoryName : '', 
      producto.stock, 
      producto.minQuantityWarning || '', 
    ]);
  
    const worksheetData = [...encabezado, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
    ];
  
    // Crear el libro de trabajo y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Productos');
  
    // Guardar el archivo con la fecha
    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `${formattedDate}_Lista_Productos.xlsx`);
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
    this.router.navigate(['home/new-product']);
  }

  verificarMin(): boolean {
    if (this.cantMinima === null) {
      this.mensajeValidacionMin = '';
      return true;
    }

    if (this.cantMinima < 0) {
      this.mensajeValidacionMin = 'El número no puede ser menor a cero';
      return false;
    }

    if (this.cantMaxima !== null && this.cantMinima > this.cantMaxima) {
      this.mensajeValidacionMin =
        'La cantidad mínima no puede ser mayor a la cantidad máxima';
      return false;
    }

    this.mensajeValidacionMin = '';
    return true;
  }

  verificarMax(): boolean {
    if (this.cantMaxima === null) {
      this.mensajeValidacionMax = '';
      return true;
    }

    if (this.cantMaxima < 0) {
      this.mensajeValidacionMax = 'No puedes poner un número menor a cero';
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

  irAgregarDetalles(id: number) {
    this.stockAumentoService.setId(id);
    this.abrirModalAumentoStock(id);
  }

  // Nombre del producto para el título del modal
  nombreProducto: string = ''; // Puedes cargar esto dinámicamente
  selectedProveedor: any;

  // Opciones para el proveedor en el ng-select
  proveedorOptions = [
    { id: 1, nombre: 'Proveedor A' },
    { id: 2, nombre: 'Proveedor B' },
    { id: 3, nombre: 'Proveedor C' },
  ];

  // Método para abrir el modal
  openAumentoStockModal(nombreProducto: string) {
    this.nombreProducto = nombreProducto;
    this.showAumentoStockModal = true;
  }

  // Método para cerrar el modal y limpiar el fondo negro
  closeAumentoStockModal() {
    const modalElement = document.getElementById('aumentoStock'); // Cambia 'aumentoStock' por el ID de tu modal
    if (modalElement) {
      // Obtener instancia del modal de Bootstrap
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide(); // Oculta el modal usando Bootstrap
      }

      // Limpieza completa del modal
      setTimeout(() => {
        // Remover clases del body relacionadas con el modal
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');

        // Remover los elementos backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach((backdrop) => backdrop.remove());

        // Limpiar los atributos y estilos del modal para ocultarlo
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');

        // Remover cualquier estilo inline que pueda haber quedado
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach((modal) => {
          (modal as HTMLElement).style.display = 'none';
        });
      }, 100); // Esperar un momento para asegurarse de que Bootstrap haya terminado de ocultar el modal
    }
  }

  // Método para manejar el clic en el fondo del modal
  handleModalBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeAumentoStockModal();
    }
  }

  // Método para mostrar el mensaje de éxito con SweetAlert
  onStockIncreaseSuccess() {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Aumento de stock registrado con éxito.',
      confirmButtonColor: '#28a745', // Verde para el botón
    }).then(() => {
      this.closeAumentoStockModal(); // Cierra el modal después de mostrar el mensaje
    });
  }
}
