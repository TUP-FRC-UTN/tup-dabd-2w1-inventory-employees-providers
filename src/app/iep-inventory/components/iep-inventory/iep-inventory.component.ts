import { Component, inject, OnDestroy, OnInit, AfterViewInit, } from '@angular/core';
import { debounceTime, Observable, Subscription } from 'rxjs';
import { ProductService } from '../../inventory-services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockAumentoService } from '../../inventory-services/stock-aumento.service';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-bs5';
import DataTable from 'datatables.net-dt';
import jsPDF from 'jspdf';
import { IepStockIncreaseComponent } from '../iep-stock-increase/iep-stock-increase.component';
import { Details } from '../../models/details';
import { ProductCategory } from '../../models/product-category';
import { ProductXDetailDto } from '../../models/product-xdetail-dto';
import { CategoriaService } from '../../inventory-services/categoria.service';
import { DetailServiceService } from '../../inventory-services/detail-service.service';
import { EstadoService } from '../../inventory-services/estado.service';
@Component({
  selector: 'app-iep-inventory',
  standalone: true,
  imports: [FormsModule, CommonModule, IepStockIncreaseComponent],
  templateUrl: './iep-inventory.component.html',
  styleUrl: './iep-inventory.component.css',
})
export class IepInventoryComponent implements OnInit, OnDestroy, AfterViewInit {

  // Variables necesarias para el filtrado por fecha
  startDate: string = '';
  endDate: string = '';


  onStartDateChange(): void {
    const startDateInput = document.getElementById('startDate') as HTMLInputElement;
    this.startDate = startDateInput.value;
    this.applyDateFilter();
  }

  onEndDateChange(): void {
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;
    this.endDate = endDateInput.value;
    this.applyDateFilter();
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

  categorias: ProductCategory[] = [];
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
        this.aplicarFiltros();
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
      next: (categorias) => {
        this.categorias = categorias;
        console.log(this.categorias);
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

  aplicarFiltros(): void {
    this.productosFiltered = [];
    if (this.cantMinima > this.cantMaxima) {
      this.validoMin = false;
    } else {
      this.validoMin = true;
    }
    if (this.cantMaxima < this.cantMinima) {
      this.validoMax = false;
    } else {
      this.validoMax = true;
    }

    if (!this.reusable) {
      this.reusable = 0;
    }
    /*     if (!this.cantMaxima) {
          this.cantMaxima = 0;
        }
        if (!this.cantMinima) {
          this.cantMinima = 0;
        } */
    console.log(this.reusable);
    this.productosFiltered = this.productosALL.filter((producto) => {
      const nombreCumple =
        this.nombre === '' ||
        producto.name.toLowerCase().includes(this.nombre.toLowerCase());
      const categoriaCumple =
        this.categoria == 0 || producto.category.categoryId == this.categoria;
      if (producto.reusable == true && this.reusable == 1) {
        var reusableCumple = true;
      } else if (producto.reusable == false && this.reusable == 2) {
        var reusableCumple = true;
      } else if (this.reusable == 0) {
        var reusableCumple = true;
      } else {
        var reusableCumple = false;
      }
      const amount = producto.detailProducts.length;
      const minQuantityWarningCumple =
        this.cantMinima == 0 || amount >= this.cantMinima;
      const maxQuantityWarningCumple =
        this.cantMaxima == 0 || amount <= this.cantMaxima;
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
      order: [[0, 'desc']],
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

  cleanFilters(): void {
    this.categoria = 0;
    this.reusable = 0;
    this.cantMinima = 0;
    this.cantMaxima = 0;
    this.nombre = '';
    this.aplicarFiltros();
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
    doc.save('Lista_Productos.pdf');
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
    XLSX.writeFile(workbook, 'Lista_Productos.xlsx');
  }

  irMenu() {
    this.router.navigate(['']);
  }

  irDetalles(id: number) {
    this.detalleProductoService.setId(id);
    this.router.navigate(['detalle-inventario']);
  }



  irAgregarProducto() {
    /* this.modalVisible = true; // Muestra el modal */
    this.router.navigate(["new-product"])
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
