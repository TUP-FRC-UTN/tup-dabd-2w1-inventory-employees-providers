import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import { CategoriaService } from '../../services/categoria.service';
import { ProductCategory } from '../../models/product-category';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-iep-categories-list',
  templateUrl: './iep-categories-list.component.html',
  styleUrls: ['./iep-categories-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  standalone: true
})
export class IepCategoriesListComponent implements OnInit {
  private categoryService: CategoriaService;
  categories: ProductCategory[] = [];
  private table: any;
  filteredData: ProductCategory[] = [];

  constructor(categoryService: CategoriaService) { 
    this.categoryService = categoryService;
  }

  ngOnInit() {
    this.loadCategories();
  }

  initializeDataTable() {
    // Destruir la tabla si ya existe
    if (this.table) {
      this.table.destroy();
    }

    this.table = $('#categoryTable').DataTable({
      dom:
          '<"mb-3"t>' +
          '<"d-flex justify-content-between"lp>',
      data: this.categories, // Usar directamente el array de categorías
      columns: [
        { 
          data: 'category',
          title: 'Categoría'
        },
        {
          data: null,
          title: 'Acciones',
          orderable: false,
          render: (data: any, type: any, row: any) => {
            return `
              <div class="dropdown">
                <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" 
                   style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                  &#8942;
                </a>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li><a class="dropdown-item edit-btn" href="#" data-id="${row.id}">Editar</a></li>
                  <li><a class="dropdown-item delete-btn" href="#" data-id="${row.id}">Eliminar</a></li>
                </ul>
              </div>`;
          }
        }
      ],
      pageLength: 10,
      lengthChange: true,
      lengthMenu: [10, 25, 50],
      searching: false,
      language: {
        emptyTable: "No hay datos disponibles en la tabla",
        zeroRecords: "No se encontraron coincidencias",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        infoEmpty: "Mostrando 0 a 0 de 0 entradas",
        infoFiltered: "(filtrado de _MAX_ entradas totales)",
        search: 'Buscar:',
        paginate: {
          first: '<<',
          last: '>>',
          next: '>',
          previous: '<',
        },
        lengthMenu: '_MENU_',
      }
    });

    // Configurar los listeners para los botones
    this.setupTableListeners();
  }

  setupTableListeners() {
    $('#categoryTable').on('click', '.edit-btn', (event) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('id');
      // Implementar lógica de edición
      console.log('Editar categoría:', id);
    });

    $('#categoryTable').on('click', '.delete-btn', (event) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('id');
      // Implementar lógica de eliminación
      console.log('Eliminar categoría:', id);
    });
  }

  loadCategories() {
    this.categoryService.getCategorias().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredData = [...categories];
        // Inicializar la DataTable después de obtener los datos
        setTimeout(() => {
          this.initializeDataTable();
        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      },
    });
  }
}