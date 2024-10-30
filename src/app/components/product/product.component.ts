import { Component, NgModule } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProvidersService } from '../../services/providers.service';
import { RouterModule } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { CreateProductDtoClass } from '../../models/create-product-dto-class';
import { ProductCategory } from '../../models/product-category';
import { Provider } from '../../models/provider';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  private productService: ProductService;
  private providerService: ProvidersService;
  categories: ProductCategory[] = [];
  categories$: Observable<ProductCategory[]>= new Observable<ProductCategory[]>();
  providers: Provider[] = [];
  providers$: Observable<Provider[]>= new Observable<Provider[]>();
  dto: CreateProductDtoClass = new CreateProductDtoClass();
  categoriesError: boolean = false;
  providersError: boolean = false;
  help: boolean = false;
  createProduct$: Observable<any>= new Observable<any>();
  success: boolean | undefined;
  requestInProgress: boolean = false;
  abrirModal: boolean = false;
  successMessage: string|undefined;
  errorMessage: string|undefined;


  constructor(productService: ProductService,
    providersService: ProvidersService,private categoryService:CategoriaService) {
    this.productService = productService;
    this.providerService = providersService;
    this.success = false;
  }

  ngOnInit() {

    this.loadCategories();

    this.providers$ = this.providerService.getProviders();
    this.providers$.subscribe({
      next: providers =>{
        this.providers = providers;
        console.log(providers);
        this.providersError = false;
      },
      error: error => this.providersError = true
    })
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.dto.supplier_id == null || this.dto.supplier_id === 0) {
        this.dto.supplier_id = undefined;
      }
      if(this.dto.unitPrice == null || this.dto.unitPrice === 0) {
        this.dto.unitPrice = 0;
      }
      this.abrirModal = true;
      this.createProduct$ = this.productService.createProduct(this.dto, 1);
      console.log(this.createProduct$);
      this.createProduct$.subscribe({
        next: response => {
          this.success = true;
          this.successMessage = response.message;
          console.log("PASO: ", response);
          form.reset();
        },
        error: error => {
          if(error.error.message === '400 Ya existe un producto con ese nombre') {
            this.errorMessage = 'Ya existe un producto con ese nombre';
          }else if( error.error.message === '400 No existe el proveedor ingresado') {
            this.errorMessage = 'No existe el proveedor ingresado';
          }else if( error.error.message === '400 No existe la categoria ingresada') {
            this.errorMessage = 'La categoría ingresada no existe';
          }else if( error.error.message === '400 Estado invalido') {
            this.errorMessage = 'El estado del producto ingresado es inválido';
          }else if( error.error.message === '500 Error al crear el producto') {
            this.errorMessage = 'Ha ocurrido un error al crear el producto.';
          }else{
            this.errorMessage = 'Ha ocurrido un error al crear el producto.';
          }
          console.error(error);
          this.success = false;
          form.reset();
        },
        complete: () => {
          console.log('Petición completada');
        }
      });
    }
  }


  loadCategories(){
    this.categories$ = this.categoryService.getCategorias();
    this.requestInProgress = true;
    this.categories$.subscribe({
      next: categories => {
        this.categories = categories;
        console.log(categories);
        this.categoriesError = false;
        this.requestInProgress = false;
      },
      error: error => {
        console.error(error);
        this.categoriesError = true;
        this.requestInProgress = false;
        console.error('Error al obtener las categorías de productos');
      },
    });
  }

  closeModal() {
    this.abrirModal = false;
  }


  openModal(): void {
    /*const dialogRef = this.dialog.open(ModalSelectComponent, {
      width: '400px'
    });*/
  
   /* dialogRef.componentInstance.categoryAdded.subscribe(() => {
      this.loadCategories(); 
    });

    /*dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se cerró', result);
      
    });*/
  }

  goBack() {
    window.history.back();
  }  
}
