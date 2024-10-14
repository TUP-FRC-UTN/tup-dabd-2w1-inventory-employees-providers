import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, Observable, Subscription } from 'rxjs';
import { ProductCategory } from '../../interfaces/product-category';
import { CategoriaService } from '../../services/categoria.service';
import { EstadoService } from '../../services/estado.service';
import { ProductService } from '../../services/product.service';
import { DtoProducto } from '../../interfaces/dto-producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DetailServiceService } from '../../services/detail-service.service';
import { StockAumentoService } from '../../services/stock-aumento.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit, OnDestroy {
  private categoriaService = inject(CategoriaService)
  private estadoService = inject(EstadoService)
  private productoService = inject(ProductService)
  private detalleProductoService = inject(DetailServiceService)
  private stockAumentoService = inject(StockAumentoService)
  private router = inject(Router)

  dataCategorias: Observable<ProductCategory[]> = new Observable<ProductCategory[]>();
  dataEstados: Observable<String[]> = new Observable<String[]>();
  dataProductos: Observable<DtoProducto[]> = new Observable<DtoProducto[]>(); 

  private categoriasSubscription: Subscription | undefined;  // Almacena la suscripción a categorias
  private estadosSubscription: Subscription | undefined;  // Almacena la suscripción a estados
  private productosSubscription: Subscription | undefined; // Almacena la suscripción a productos

  categorias: ProductCategory[] = [];
  estados: String[] = [];
  productos: DtoProducto[] = [];

  categoria: number = 0;
  reusable?: boolean;
  cantMinima: number = 0;
  cantMaxima: number = 0;
  nombre: string = '';

  valido: boolean = true;
  mensajeValidacion: string = "";



  ngOnInit(): void {
    this.cargarDatos();
    this.cargarProductos();
  }
  
  cargarDatos(){
    this.dataCategorias = this.categoriaService.getCategorias();
    this.categoriasSubscription = this.dataCategorias.subscribe(categories => this.categorias = categories);
    this.dataEstados = this.estadoService.getEstados();
    this.estadosSubscription = this.dataEstados.subscribe( estados => this.estados = estados);
  }

  cargarProductos(){
    this.valido = this.verificar();
    
    if(!this.valido){
      return;
    }
    else{
      this.dataProductos = this.productoService.getDtoProducts(this.categoria,this.reusable,this.cantMinima,this.cantMaxima,this.nombre);
      this.productosSubscription = this.dataProductos.subscribe(productos => this.productos = productos);
    }
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


  verificar(){
    if (this.cantMinima > this.cantMaxima) {
      if (this.cantMaxima !== 0 && this.cantMaxima !== null) {
        this.mensajeValidacion = "La cantidad minima no puede ser mayor a la cantidad maxima"
        return false;
      }
    }
        
    this.mensajeValidacion = "";
    return true;
  }

  ngOnDestroy(): void {
    if (this.categoriasSubscription) { this.categoriasSubscription.unsubscribe() }
    if (this.estadosSubscription) { this.estadosSubscription.unsubscribe() }
    if (this.productosSubscription) { this.productosSubscription.unsubscribe() }
  }
}
