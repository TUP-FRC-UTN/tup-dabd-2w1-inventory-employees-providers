import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PutCategoryDTO } from '../../models/putCategoryDTO';
import { CategoriaService } from '../../services/categoria.service';
import { ProductCategory } from '../../models/product-category';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersMockIdService } from '../../../common-services/users-mock-id.service';
import { ProductService } from '../../services/product.service';
import * as XLSX from 'xlsx';
declare var bootstrap: any; // Añadir esta declaración al principio
@Component({
  selector: 'app-iep-categories-list',
  templateUrl: './iep-categories-list.component.html',
  styleUrls: ['./iep-categories-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  standalone: true
})
export class IepCategoriesListComponent implements OnInit {

  selectedStatus = {
    active: false,
    inactive: false
  };

  get selectedStatusCount(): number {
    return Object.values(this.selectedStatus).filter(value => value).length;
  }

  private usersMockService: UsersMockIdService;
  private categoryService: CategoriaService;
  categories: ProductCategory[] = [];
  private table: any;
  filteredData: ProductCategory[] = [];
  categoryToDelete: number | undefined;
  idCategoryToEdit: number | null = null;
  categoryToEdit: ProductCategory | undefined;
  descrCategoryToEdit: string = '';
  categoryToCreate: string = '';
  private productService: ProductService;
  errorMessage: string = '';


  idUser: number = 0;
  constructor(categoryService: CategoriaService,
    usersMockService: UsersMockIdService,
    productService: ProductService) {
    this.usersMockService = usersMockService;
    this.categoryService = categoryService;
    this.productService = productService
  }

  exportToPdf(): void {
    const doc = new jsPDF();

    const pageTitle = 'Listado de Categorias';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);

    const dataToExport = this.categories.map((category) => [
      category.category,
      category.discontinued ? 'Inactivo' : 'Activo'
    ]);

    (doc as any).autoTable({
      head: [['Categoría', 'Estado']],
      body: dataToExport,
      startY: 30, 
      theme: 'grid',  
      margin: { top: 30, bottom: 20 },  
      styles: {
        fontSize: 10,  
        cellPadding: 5,  
        halign: 'center', 
      },
    });

    doc.save(`Lista_Categorías_${this.getFormattedDate()}.pdf`);
  }

  exportToExcel(): void {
    const encabezado = [
      ['Listado de Categorías'],
      [],
      ['Categoría', 'Estado'] 
    ];

    // Datos a exportar
    const excelData = this.categories.map((category) => {
      return [
        category.category,
        category.discontinued ? 'Inactivo' : 'Activo',
      ];
    });

    const worksheetData = [...encabezado, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Categorías');

    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `Lista_Categorías_${formattedDate}.xlsx`);
}

  

  getFormattedDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  ngOnInit() {
    this.loadCategories();
  }

  private refreshDataTable(): void {
    if (this.table) {
      this.table.clear();
      this.table.rows.add(this.filteredData);
      this.table.draw();
    } else {
      this.initializeDataTable();
    }
  }

  filterData(event?: any): void {
    const searchTerm = event?.target?.value?.toLowerCase().trim() ||
      (document.getElementById('searchTerm') as HTMLInputElement)?.value?.toLowerCase().trim() || '';

    this.filteredData = this.categories.filter(cat => {
      const matchesSearch = cat.category.toLowerCase().includes(searchTerm);
      const matchesStatus =
        (!this.selectedStatus.active && !this.selectedStatus.inactive) || // Si no hay filtros de estado seleccionados
        (this.selectedStatus.active && !cat.discontinued) || // Si está seleccionado "Activo"
        (this.selectedStatus.inactive && cat.discontinued); // Si está seleccionado "Inactivo"

      return matchesSearch && matchesStatus;
    });

    this.refreshDataTable();
  }

  cleanFilters(): void {
    // Limpia los valores de los inputs en el DOM
    const textInputs = document.querySelectorAll('input.form-control');
    textInputs.forEach(input => (input as HTMLInputElement).value = '');

    // Resetear los filtros de estado
    this.selectedStatus.active = false;
    this.selectedStatus.inactive = false;

    this.filteredData = [...this.categories];
    this.refreshDataTable();
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
          data: 'discontinued',
          title: 'Estado',
          visible: true,
          render: (data: any, type: any, row: any) => {
            return data ? 'Inactivo' : 'Activo';
          }
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
                  <li><a class="dropdown-item edit-btn" href="#" 
                  data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#categoriaModal">Editar</a></li>
                  <li class="dropdown-divider"></li>
                  <li><a class="dropdown-item delete-btn" href="#" data-id="${row.id}">Eliminar</a></li>
                </ul>
              </div>`;
          },

        }
      ],
      pageLength: 5,
      lengthChange: true,
      lengthMenu: [5, 10, 25, 50],
      searching: false,
      language: {
        emptyTable: "No hay datos disponibles en la tabla",
        zeroRecords: "No se encontraron coincidencias",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        infoEmpty: "Mostrando 0 a 0 de 0 entradas",
        infoFiltered: "(filtrado de _MAX_ entradas totales)",
        search: 'Buscar:',
        lengthMenu: '_MENU_',
      }
    });

    this.setupTableListeners();
  }

  showConfirmDeleteModal() {
    Swal.fire({
      title: '¿Estás seguro de querer eliminar la categoría?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.searchForProductsWithCategory();

      }
    });
  }

  showSuccessDeleteAlert() {
    Swal.fire({
      title: 'Categoría eliminada',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.loadCategories();
      this.closeModal();
    });
  }

  showFailureDeleteAlert() {
    Swal.fire({
      title: 'Error al eliminar categoría',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.closeModal();
    });
  }

  showFailureCreateAlert() {
    Swal.fire({
      title: 'Error al crear categoría',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      text: this.errorMessage,
    }).then(() => {
      this.closeModal();
    });
  }

  showSuccessEditAlert() {
    Swal.fire({
      title: 'Categoría editada',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.loadCategories();
      this.closeModal();

    });
  }

  showFailureEditAlert() {
    Swal.fire({
      title: 'Error al editar categoría',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.closeModal();
    });
  }

  showSuccessCreateAlert() {
    Swal.fire({
      title: 'Categoría creada',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.loadCategories();
      this.closeModal();

    });
  }

  deleteCategory() {
    if (this.categoryToDelete === null || this.categoryToDelete === undefined) {
      console.error('No se ha seleccionado una categoría para eliminar');
      return;
    }
    this.categoryService.deleteCategory(
      this.categoryToDelete, this.usersMockService.getMockId()).subscribe({
        next: (response) => {
          console.log('Categoría eliminada:', response);
          this.showSuccessDeleteAlert();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
        },
      });
  }

  showProductsInCategoryAlert(products: any) {
    Swal.fire({
      title: 'Productos en categoría',
      html: `
        <p>La categoría que intentas eliminar tiene productos asociados.</p>
        <p>Por favor, elimina los productos antes de continuar.</p>
        <ul>
          ${products.map((product: any) => `<li>${product.name}</li>`).join('')}
        </ul>
      `,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
  }


  searchForProductsWithCategory(): any {
    /* this.productService.getDtoProducts(this.categoryToDelete).subscribe({
       next: (products) => {
         console.log('Productos con categoría:', products);
         if(products.length > 0){
           this.showProductsInCategoryAlert(products);
           this.closeModal();
         }else{
           this.deleteCategory();
         }
 
       },
       error: (error) => {
         console.error('Error al buscar productos por categoría:', error);
       },
   });*/
    this.deleteCategory();

  }

  updateCategory() {
    if (this.idCategoryToEdit === null || !this.categoryToEdit) {
      this.categoryService.postCategory(
        this.descrCategoryToEdit, this.usersMockService.getMockId()).subscribe({
          next: (response) => {
            console.log('Pasa:', response);
            this.showSuccessCreateAlert();
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error al registrar categoría:', error);
            if (error.error.message === '400 Category already exists') {
              this.errorMessage = 'La categoría que intenta ingresar ya existe';
            }
            this.showFailureCreateAlert();
          },
        });
    } else {
      const dto: PutCategoryDTO =
        { id: this.idCategoryToEdit, category: this.descrCategoryToEdit };
      this.categoryService.putCategory(dto, this.usersMockService.getMockId()).subscribe({
        next: (response) => {
          console.log('Pasa:', response);
          this.showSuccessEditAlert();
          this.loadCategories();
        },
        error: (error) => {
          this.showFailureEditAlert();
          console.error('Error al registrar categoría:', error);
        },
      });
    }
  }

  setupTableListeners() {
    $('#categoryTable').on('click', '.edit-btn', (event) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('id');
      this.setCategoryToEdit(id);
    });

    $('#categoryTable').on('click', '.delete-btn', (event) => {
      event.preventDefault();
      const id = $(event.currentTarget).data('id');
      this.setCategoryToDelete(id);
      this.showConfirmDeleteModal();
    });
  }

  setCategoryToDelete(id: number) {
    this.categoryToDelete = id;
    console.log('Eliminar categoría:', this.categoryToDelete);
  }

  setCategoryToEdit(id: number) {
    this.idCategoryToEdit = id;
    this.categoryToEdit = this.categories.find(cat => cat.id === id);
    this.descrCategoryToEdit = this.categoryToEdit?.category || '';
    console.log('Editar categoría:', this.idCategoryToEdit);
    console.log('Categoría:', this.categoryToEdit);
  }

  private closeModal() {
    const modalElement = document.getElementById('categoriaModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // Limpieza completa del modal y sus efectos
      setTimeout(() => {
        // Remover clases del body
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');

        // Remover todos los backdrops
        const backdrops = document.getElementsByClassName('modal-backdrop');
        while (backdrops.length > 0) {
          backdrops[0].remove();
        }

        // Limpiar el modal
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');

        // Remover cualquier estilo inline que Bootstrap pueda haber añadido
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach(modal => {
          (modal as HTMLElement).style.display = 'none';
        });
      }, 100);
    }
  }




  loadCategories() {
    this.categoryService.getCategorias().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Categorías cargadas:', categories);
        this.filteredData = [...categories];
        setTimeout(() => {
          this.refreshDataTable();
        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      },
    });
  }
}