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
  filteredProducts: (Product & { selected: boolean })[] = []; // Nueva lista filtrada
  searchTerm: string = ''; // Término de búsqueda
  selectAll: boolean = false;

  @Output() selectedProductsChange = new EventEmitter<number[]>(); // Para emitir los IDs seleccionados

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  ngAfterViewInit() {
    // Inicializa los tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl: any) {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data.map(product => ({ ...product, selected: false }));
        this.filteredProducts = this.products; // Inicialmente, muestra todos los productos
      },
      error => {
        console.error('Error loading products', error);
      }
    );
  }

  // Filtrar productos por el término de búsqueda cuando se ingresan al menos 3 letras
  filterProducts() {
    if (this.searchTerm.length >= 3) {
      const lowerTerm = this.searchTerm.toLowerCase();
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(lowerTerm) || 
        product.supplier.name.toLowerCase().includes(lowerTerm) ||
        product.details.description.toLowerCase().includes(lowerTerm) // Agregamos filtro por descripción
      );
    } else {
      this.filteredProducts = this.products; // Mostrar todos los productos si hay menos de 3 letras
    }
  }

  // Cambia el estado de selección de todos los productos
  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.filteredProducts.forEach(product => product.selected = isChecked); // Solo selecciona los filtrados
    this.selectAll = isChecked;
    this.emitSelectedProducts(); // Emitir los seleccionados
  }

  // Actualiza el checkbox de "Seleccionar todos" dependiendo de la selección individual
  updateSelectAll() {
    this.selectAll = this.filteredProducts.every(product => product.selected); // Solo verifica los filtrados
    this.emitSelectedProducts(); // Emitir los seleccionados
  }

  // Función para emitir los IDs seleccionados
  emitSelectedProducts() {
    const selectedIds = this.filteredProducts
      .filter(product => product.selected)
      .map(product => product.id);
    this.selectedProductsChange.emit(selectedIds); // Emitir los IDs seleccionados
  }
}
