import { Component, inject, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { debounceTime, Observable, Subscription } from 'rxjs';
import { CategoriaService } from '../../services/categoria.service';
import { EstadoService } from '../../services/estado.service';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DetailServiceService } from '../../services/detail-service.service';
import { StockAumentoService } from '../../services/stock-aumento.service';
import { DtoProducto } from '../../models/dto-producto';
import { ProductCategory } from '../../models/product-category';

import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-bs5';
import { ProductXDetailDto } from '../../models/product-xdetail-dto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit, OnDestroy, AfterViewInit {
  private categoriaService = inject(CategoriaService)
  private estadoService = inject(EstadoService)
  private productoService = inject(ProductService)
  private detalleProductoService = inject(DetailServiceService)
  private stockAumentoService = inject(StockAumentoService)
  private router = inject(Router)

  categorias$: Observable<ProductCategory[]> = new Observable<ProductCategory[]>();
  estados$: Observable<String[]> = new Observable<String[]>();



  productos$:Observable<ProductXDetailDto[]> = new Observable<ProductXDetailDto[]>();
  productosALL: ProductXDetailDto[] = [];
  productosFiltered: ProductXDetailDto[] = [];


  categorias: ProductCategory[] = [];
  estados: String[] = [];
  productos: DtoProducto[] = [];

  categoria: number = 0;
  reusable?: boolean;
  cantMinima: number = 0;
  cantMaxima: number = 0;
  nombre: string = '';

  private table: any;

  validoMin: boolean = true;
  validoMax: boolean = true;
  mensajeValidacionMin: string = "";
  mensajeValidacionMax: string = "";

  ngOnInit(): void {
    this.cargarDatos();
    //se cambio cargarProductos() por cargarProductos1()
    this.cargarProductos1();
    this.initializeDataTable();
  }

  cargarProductos1(){
    this.productos$ = this.productoService.getAllProducts();
    this.productos$.subscribe({
      next: (productos) => {
        this.productosALL = productos;
        this.productosFiltered = productos;
        console.log(this.productosALL);
        this.cargarProductos();
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      }
    });
  }

  ngAfterViewInit(): void {
  }
  
  cargarDatos(){
    this.categorias$ = this.categoriaService.getCategorias();
    this.categorias$.subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      }
    });
    this.estados$ = this.estadoService.getEstados();
    this.estados$.subscribe({
      next: (estados) => {
        this.estados = estados;
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Completado');
      }
    });
  }

  cargarProductos(){
    console.log("Cargar productos");
    /*this.validoMin = this.verificarMin();
    this.validoMax = this.verificarMax();

    if(!this.validoMin || !this.validoMax){
      return;
    }
    else{*/
      this.productosFiltered = this.productosALL;
      /*this.dataProductos = this.productoService.getDtoProducts(this.categoria, this.reusable, this.cantMinima, this.cantMaxima, this.nombre);
      this.productosSubscription = this.dataProductos.subscribe(productos => {
        this.productos = productos;
        this.updateDataTable();
      });*/
      for(let i = 0; i < this.productosALL.length; i++){
        if(this.categoria !== 0 && this.productosALL[i].category_id !== this.categoria){
          this.productosFiltered = this.productosFiltered.filter(producto => producto.id !== this.productosALL[i].id);
        }
        if(this.reusable !== undefined && this.productosALL[i].reusable !== this.reusable){
          this.productosFiltered = this.productosFiltered.filter(producto => producto.id == this.productosALL[i].id);
        }
        if(this.cantMaxima !== 0 && this.productosALL[i].minQuantityWarning > this.cantMaxima){
          this.productosFiltered = this.productosFiltered.filter(producto => producto.id == this.productosALL[i].id);
        }
        if(this.nombre !== '' && !this.productosALL[i].name.toLowerCase().includes(this.nombre.toLowerCase())){
          this.productosFiltered = this.productosFiltered.filter(producto => producto.id == this.productosALL[i].id);
        }
      }
      console.log(this.productosFiltered);
      this.updateDataTable();
    //}
  }

  initializeDataTable(): void {
    this.table = $('#productsList').DataTable({
      data: this.productosFiltered,
      columns: [
        { data: 'name', title: 'Nombre' },
        { data: 'category', title: 'Categoria',
          render: (data: any) => {
            return data.categoryName;
          }
         },
        { 
          data: 'reusable', 
          title: 'Reusable',
          render: (data: boolean) => data ? 'SI' : 'NO'
        },
        { data: 'detailProducts', title: 'Cantidad de items',
          render: (data: any) => {
            return data.length;
          }
         },
         {
          data: 'minQuantityWarning', title: 'Cantidad mínima para alerta'
         },
         {
          data:'detailProducts', title: 'Fecha de último ingreso',
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
            if(lastDate){
              return this.formatDate(lastDate);
            }else{
              return "";
            }
          },
        },
        {
          data: null,
          title: 'Acciones',
          render: (data: any, type: any, row: any) => {
            return `
              <div class="dropdown">
                <a class="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Acciones
                </a>
                <ul class="dropdown-menu">
                  <li><button class="dropdown-item btn botonDetalleCrear"
                  data-id="${row.id}">Agregar</button></li>
                  <li><button class="dropdown-item btn botonDetalleConsultar" data-id="${row.id}">Consultar</button></li>
                </ul>
              </div>
            `;
          }
        },
      ],
      pageLength: 10,
      lengthChange: false,
      searching: false,
      ordering: true,
      order:[[5, 'desc']],
      language: {
        search: "",
        info: "",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
      },
    });

    $('#productsList').on('click', '.botonDetalleCrear', (event) => {
      const id = $(event.currentTarget).data('id');
      this.irAgregarDetalles(id);
    });

    $('#productsList').on('click', '.botonDetalleConsultar', (event) => {
      const id = $(event.currentTarget).data('id');
      this.irDetalles(id);
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
    this.reusable = undefined;
    this.cantMinima = 0;
    this.cantMaxima = 0;
    this.nombre = '';
    this.cargarProductos();
  }




  generarPdf(): void {
    this.productoService.getProductosPdf().subscribe((pdfArrayBuffer) => {
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'productos_inventario.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  generarExcel() : void{
    //window.open(this.detailService.urlExcel, '_blank');

    const enlace = document.createElement('a');
    enlace.href = this.productoService.productExcelPdf; // URL del archivo
    enlace.download = ''; // Esto sugiere al navegador que debe descargar el archivo
    document.body.appendChild(enlace); // Necesario para algunos navegadores
    enlace.click(); // Simula el clic en el enlace
    document.body.removeChild(enlace); // Limpieza
  }

  irMenu(){
    this.router.navigate(['']);
  }

  irDetalles(id: number){
    this.detalleProductoService.setId(id);
    this.router.navigate(["detalle-inventario"])
  }

  irAgregarDetalles(id: number){
    this.stockAumentoService.setId(id);
    this.router.navigate(["stock-aumento"])
  }

  irAgregarProducto(){
    this.router.navigate(["registro-productos"])
  }


  verificarMin(){
    if ( this.cantMinima < 0) { 
      this.mensajeValidacionMin = "Nneo puedes por un numero menor a cero" 
      return false
    }
    if (this.cantMinima > this.cantMaxima) {
      if (this.cantMaxima !== 0 && this.cantMaxima !== null) {
        this.mensajeValidacionMin = "La cantidad minima no puede ser mayor a la cantidad maxima"
        return false;
      }
    }
        
    this.mensajeValidacionMin = "";
    return true;
  }

  verificarMax(){
    if (this.cantMaxima < 0){ 
      this.mensajeValidacionMax = "No puedes poner un numero menor a cero"
      return false
    }

    this.mensajeValidacionMax = "";
    return true;
  }



  ngOnDestroy(): void {
    if (this.categoriasSubscription) { this.categoriasSubscription.unsubscribe() }
    if (this.estadosSubscription) { this.estadosSubscription.unsubscribe() }
    if (this.productosSubscription) { this.productosSubscription.unsubscribe() }
  }
}
