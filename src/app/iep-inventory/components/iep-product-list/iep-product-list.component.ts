import { Component, OnInit } from '@angular/core';
import { CategoryDTO, ProductDTO, StatusProduct } from '../../models/list-product';
import { ListProductService } from '../../services/list-product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-iep-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './iep-product-list.component.html',
  styleUrl: './iep-product-list.component.css'
})
export class IepProductListComponent implements OnInit  {
  products: ProductDTO[] = [];
  categories: Map<number, string> = new Map();
  loading: boolean = true;
  
  constructor(private productService: ListProductService) {}

  ngOnInit(): void {
    // Cargar categorías
    this.productService.getAll().subscribe({
      next: (categories: CategoryDTO[]) => {
        categories.forEach(cat => this.categories.set(cat.id, cat.category));
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.productService.findAll().subscribe({
      next: (products: ProductDTO[]) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  getCategoryName(categoryId: number): string {
    return this.categories.get(categoryId) || 'N/A';
  }

  getStatusClass(status: StatusProduct): string {
    return status === StatusProduct.ACTIVE ? 'badge bg-success' : 'badge bg-danger';
  }
}
