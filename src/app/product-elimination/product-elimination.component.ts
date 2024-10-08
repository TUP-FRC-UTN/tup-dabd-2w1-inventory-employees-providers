import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { ProductTableComponent } from "../product-table/product-table.component";

@Component({
  selector: 'app-product-elimination',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductTableComponent],
  templateUrl: './product-elimination.component.html',
  styleUrl: './product-elimination.component.css'
})
export class ProductEliminationComponent {
  justification: string = '';
  selectedProductIds: number[] = []; // Guardar los IDs seleccionados

  constructor(private productService: ProductService) {}

  onSubmit() {
    if (this.justification.trim() && this.selectedProductIds.length > 0) {
      this.productService.eliminateProducts(this.justification, this.selectedProductIds)
        .subscribe(() => {
          this.justification = '';
          this.selectedProductIds = []; // Limpiar selección después de la eliminación
        }, (error) => {
          console.error(error);
        });
    }
  }

  // Función que se llamará cuando cambie la selección en ProductTableComponent
  updateSelectedProducts(ids: number[]) {
    this.selectedProductIds = ids;
  }

  goBack() {
    // Implementar la lógica para volver atrás
  }
}
