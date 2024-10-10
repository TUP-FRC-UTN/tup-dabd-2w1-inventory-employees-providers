import { Component, NgModule } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductCategory } from '../../interfaces/product-category';
import { HttpClient } from '@angular/common/http';
import { ProvidersService } from '../../services/providers.service';
import { Provider } from '../../interfaces/provider';
import { RouterModule } from '@angular/router';
import { CreateProductDTO } from '../../interfaces/create-product-dto';
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
  dto: CreateProductDTO = new CreateProductDTO();
  categoriesError: boolean = false;
  providersError: boolean = false;
  help: boolean = false;
  createProduct$: Observable<any>= new Observable<any>();
  success: boolean = false;

  constructor(productService: ProductService,providersService: 
    ProvidersService) {
    this.productService = productService;
    this.providerService = providersService;
  }

  ngOnInit() {
    this.categories$ = this.productService.getAllCategories();
    this.categories$.subscribe({
      next: categories => this.categories = categories,
      error: error => this.categoriesError = true
    });
    this.providers$ = this.providerService.getProviders();
    this.providers$.subscribe({
      next: providers => this.providers = providers,
      error: error => this.providersError = true
    })
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log(this.dto);
      this.createProduct$ = this.productService.createProduct(this.dto);
      this.createProduct$.subscribe({
      next: response => {
        this.success = true;
        alert('Producto creado con éxito');
        form.reset();
      },error: error => {
        this.success = true;
        console.log(error);
      },complete: () => {
        console.log('Petición completada');
      }
    });  
    }
  }





}
