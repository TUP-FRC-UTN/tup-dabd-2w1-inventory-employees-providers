import { Component, NgModule } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductCategory } from '../../interfaces/product-category';
import { HttpClient } from '@angular/common/http';
import { ProvidersService } from '../../services/providers.service';
import { Provider } from '../../interfaces/provider';
import { RouterModule } from '@angular/router';
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

  constructor(productService: ProductService,providersService: ProvidersService) {
    this.productService = productService;
    this.providerService = providersService;
  }

  ngOnInit() {
    this.categories$ = this.productService.getAllCategories();
    this.categories$.subscribe(categories => this.categories = categories);
    this.providers$ = this.providerService.getProviders();
    this.providers$.subscribe(providers => this.providers = providers);
  }

}
