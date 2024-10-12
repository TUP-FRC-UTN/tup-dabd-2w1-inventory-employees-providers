import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../interfaces/product';
import { ProductService } from '../services/product.service';
declare var bootstrap: any; // Asegúrate de que el tipo bootstrap sea accesible

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-table.component.html'
})
export class ProductTableComponent implements OnInit, AfterViewInit {
  products: (Product & { selected: boolean })[] = [];
  filteredProducts: (Product & { selected: boolean })[] = [];
  searchTerm: string = '';
  selectAll: boolean = false;

  // Variables para la ordenación
  currentSortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc'; // Dirección de ordenación por defecto

  @Output() selectedProductsChange = new EventEmitter<number[]>(); // Para emitir los IDs seleccionados

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  ngAfterViewInit() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl: any) {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data.map(product => ({ ...product, selected: false }));
        this.filteredProducts = this.products;
      },
      error => {
        console.error('Error loading products', error);
      }
    );
  }

  filterProducts() {
    if (this.searchTerm.length >= 3) {
      const lowerTerm = this.searchTerm.toLowerCase();
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(lowerTerm) || 
        product.supplier.name.toLowerCase().includes(lowerTerm) ||
        product.details.description.toLowerCase().includes(lowerTerm)
      );
    } else {
      this.filteredProducts = this.products;
    }
  }

  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.filteredProducts.forEach(product => product.selected = isChecked);
    this.selectAll = isChecked;
    this.emitSelectedProducts();
  }

  updateSelectAll() {
    this.selectAll = this.filteredProducts.every(product => product.selected);
    this.emitSelectedProducts();
  }

  emitSelectedProducts() {
    const selectedIds = this.filteredProducts
      .filter(product => product.selected)
      .map(product => product.id);
    this.selectedProductsChange.emit(selectedIds);
  }

  // Función para ordenar los productos por columna
  sortBy(column: string) {
    if (this.currentSortColumn === column) {
      // Si ya está ordenando por esta columna, alternar la dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una nueva columna, ordenar ascendente primero
      this.currentSortColumn = column;
      this.sortDirection = 'asc';
    }

    // Función de comparación para la ordenación
    this.filteredProducts.sort((a, b) => {
      const aValue = this.getNestedProperty(a, column);
      const bValue = this.getNestedProperty(b, column);

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Función auxiliar para obtener propiedades anidadas
  getNestedProperty(obj: any, propertyPath: string): any {
    return propertyPath.split('.').reduce((o, p) => o && o[p], obj);
  }
}
