import { Component, ElementRef, NgModule } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { delay, Observable } from 'rxjs';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductCategory } from '../../interfaces/product-category';
import { HttpClient } from '@angular/common/http';
import { ProvidersService } from '../../services/providers.service';
import { Provider } from '../../interfaces/provider';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CreateProductDTO } from '../../interfaces/create-product-dto';
import { ProductXDetailDTO } from '../../interfaces/product-xdetail-dto';
import { Router } from '@angular/router';
import { Routes } from '@angular/router';
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule,RouterOutlet],
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
  createProduct$: Observable<ProductXDetailDTO>= new Observable<ProductXDetailDTO>();
  success: boolean | undefined;
  requestInProgress: boolean = false;
  abrirModal: boolean = false;

  constructor(productService: ProductService,providersService: 
    ProvidersService) {
    this.productService = productService;
    this.providerService = providersService;
    this.success = false;
  }

  ngOnInit() {
    this.categories$ = this.productService.getAllCategories();
    this.requestInProgress = true;
    this.categories$.subscribe({
      next: categories => {
        this.categories = categories;
        console.log(categories);
        this.categoriesError = false;
        this.requestInProgress = false;
      },
      error: error => {
        this.categoriesError = true;
        this.requestInProgress = false;
        console.error('Error al obtener las categorías de productos');
      },
    });
    this.providers$ = this.providerService.getProviders();
    this.providers$.subscribe({
      next: providers =>{
        this.providers = providers;
        console.log(providers);
        this.providersError = false;
      },
      error: error => this.providersError = true
    })
    this.dto.category_id = 0;
    this.dto.supplier_id = 0;
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      if(this.dto.supplier_id == null || this.dto.supplier_id == 0) {
        this.dto.supplier_id = undefined;
      }
      console.log(this.dto);
      this.createProduct$ = this.productService.createProduct(this.dto);
      console.log(this.createProduct$);
      this.createProduct$.subscribe({
      next: response => {
        this.success = true;
        console.log(response);
        form.reset();
      },error: error => {
        this.success = false;
        console.log(error);
      },complete: () => {
        this.abrirModal = true;
        console.log('Petición completada');
      }
    });  
    
    }
  }

  closeModal() {
    this.abrirModal = false;
  }






}
