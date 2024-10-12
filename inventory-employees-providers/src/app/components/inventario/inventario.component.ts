import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductCategory } from '../../interfaces/product-category';
import { CategoriaService } from '../../services/categoria.service';
import { EstadoService } from '../../services/estado.service';
import { ProductService } from '../../services/product.service';
import { DtoProducto } from '../../interfaces/dto-producto';
import { FormsModule } from '@angular/forms';
import { console } from 'node:inspector';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  private categoriaService = inject(CategoriaService)
  private estadoService = inject(EstadoService)
  private productoService = inject(ProductService)

  dataCategorias: Observable<ProductCategory[]> = new Observable<ProductCategory[]>();
  dataEstados: Observable<String[]> = new Observable<String[]>();
  dataProductos: Observable<DtoProducto[]> = new Observable<DtoProducto[]>(); 

  categorias: ProductCategory[] = [];
  estados: String[] = [];
  productos: DtoProducto[] = [];

  categoria: number = 0;
  estado: string = '';
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
    this.dataCategorias.subscribe(categories => this.categorias = categories);
    this.dataEstados = this.estadoService.getEstados();
    this.dataEstados.subscribe( estados => this.estados = estados);
  }
  
  cargarProductos(){
    this.valido = this.verificar();
    
    if(!this.valido){
      return;
    }
    else{
      this.dataProductos = this.productoService.getDtoProducts(this.categoria,this.estado,this.cantMinima,this.cantMaxima,this.nombre);
      this.dataProductos.subscribe(productos => this.productos = productos);
    }
  }

  consultarDetalles(id: number){
    alert("Id: "+ id + " - Estado: " + this.estado)
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

}
