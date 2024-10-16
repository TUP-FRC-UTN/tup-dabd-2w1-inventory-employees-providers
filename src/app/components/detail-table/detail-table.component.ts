import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DetailServiceService } from '../../services/detail-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Details, PostDecrement } from '../../models/details';

@Component({
  selector: 'app-detail-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detail-table.component.html',
  styleUrls: ['./detail-table.component.css'],
})
export class DetailTableComponent implements OnInit, OnDestroy {
  // Propiedades
  details: Details[] = []; // Almacena todos los detalles
  filteredDetails: Details[] = []; // Almacena los detalles filtrados
  paginatedDetails: Details[] = []; // Almacena los detalles de la página actual
  selectedIds: number[] = []; // Para manejar elementos seleccionados
  justificativo: string = ''; // Para capturar el motivo de eliminación
  filterTerm: string = ''; // Para almacenar el término de búsqueda
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página
  totalPages: number = 0; // Total de páginas
  minSearchLength: number = 3; // Número mínimo de caracteres para la búsqueda
  currentSortColumn: keyof Details = 'description'; // Columna inicial para la ordenación
  sortDirection: 'asc' | 'desc' = 'asc'; // Dirección inicial de ordenación
  private subscriptions: Subscription = new Subscription(); // Inicializar Subscription
  private router = inject(Router);  // Router para moverse entre componentes

  constructor(private detailService: DetailServiceService) {}

  ngOnInit(): void {
    this.loadDetails(); // Cargar los detalles al inicializar el componente
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Cancelar todas las suscripciones al destruir el componente
  }

  // Métodos

  // Carga los detalles desde el servicio
  loadDetails(): void {
    const detailSubscription = this.detailService
      .getDetails()
      .subscribe((data: Details[]) => {
        this.details = data; // Asigna los detalles recibidos
        this.filteredDetails = data; // Inicializa la lista filtrada
        this.calculateTotalPages(); // Calcular total de páginas después de cargar detalles
        this.updatePaginatedDetails(); // Inicializar los detalles de la página
      });
    this.subscriptions.add(detailSubscription); // Añadir la suscripción
  }

  // Genera el PDF
  generatePDF(): void {
    this.detailService.getPdf().subscribe((pdfArrayBuffer) => {
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'detalle_productos.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Aplica el filtro basado en el término de búsqueda
  applyFilter(): void {
    if (this.filterTerm.length >= this.minSearchLength) {
      const term = this.filterTerm.toLowerCase();
      this.filteredDetails = this.details.filter((detail) => {
        return (
          detail.description.toLowerCase().includes(term) ||
          detail.supplierName.toLowerCase().includes(term) ||
          detail.state.toLowerCase().includes(term) ||
          detail.price.toString().includes(term)
        );
      });
      this.currentPage = 1; // Volver a la primera página si hay un filtro
    } else {
      this.filteredDetails = this.details; // Mostrar todos si no hay suficientes caracteres
    }

    this.calculateTotalPages(); // Calcular total de páginas al aplicar filtro
    this.updatePaginatedDetails(); // Actualizar detalles paginados
  }

  // Actualiza los detalles que se mostrarán en la página actual
  updatePaginatedDetails(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedDetails = this.filteredDetails.slice(start, end); // Toma un segmento de los detalles filtrados
  }

  // Calcula el total de páginas basándose en el número de detalles filtrados
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(
      this.filteredDetails.length / this.itemsPerPage
    );
  }

  // Navegación entre páginas
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedDetails(); // Actualiza los detalles para la nueva página
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedDetails(); // Actualiza los detalles para la nueva página
    }
  }

  // Selección de elementos
  toggleSelection(id: number): void {
    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      this.selectedIds.splice(index, 1); // Deseleccionar
    } else {
      this.selectedIds.push(id); // Seleccionar
    }
  }

  // Elimina los elementos seleccionados, enviando un justificativo
  deleteSelected(): void {
    if (this.justificativo.trim() === '') {
      alert('Por favor, ingresa un justificativo para continuar.');
      return;
    }

    const postDecrement: PostDecrement = {
      justify: this.justificativo,
      ids: this.selectedIds,
    };

    const deleteSubscription = this.detailService
      .postDecrement(postDecrement)
      .subscribe({
        next: (response) => {
          if (response === 'OPERACION EXITOSA') {
            alert(
              'Los elementos seleccionados han sido eliminados exitosamente.'
            );
            this.loadDetails(); // Recarga los detalles después de la eliminación
            this.justificativo = ''; // Reinicia el justificativo
            this.selectedIds = []; // Limpia la selección
          } else {
            alert('Ocurrió un problema con la operación.');
          }
        },
        error: (error) => {
          //alert('Ocurrió un error al intentar eliminar los elementos seleccionados.');
          this.loadDetails(); // Recarga los detalles en caso de error
          this.justificativo = ''; // Reinicia el justificativo
          this.selectedIds = []; // Limpia la selección
        },
      });

    this.subscriptions.add(deleteSubscription); // Añadir la suscripción
  }

  // Verifica si todos los elementos en la página actual están seleccionados
  allSelected(): boolean {
    return (
      this.selectedIds.length === this.paginatedDetails.length &&
      this.paginatedDetails.length > 0
    );
  }

  // Alterna la selección de todos los elementos en la página actual
  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox) {
      const checked = checkbox.checked;
      this.selectedIds = checked
        ? this.paginatedDetails.map((detail) => detail.id) // Selecciona todos los IDs
        : []; // Limpia la selección
    }
  }

  // Limpia el término de búsqueda y reinicia el filtro
  clearFilter(): void {
    this.filterTerm = ''; // Reiniciar el término de filtro
    this.filteredDetails = this.details; // Mostrar todos los detalles
    this.currentPage = 1; // Volver a la primera página
    this.calculateTotalPages(); // Recalcular las páginas
    this.updatePaginatedDetails(); // Actualizar detalles paginados
  }

  // Ordena los detalles por la columna especificada
  sortBy(column: keyof Details): void {
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'; // Alternar dirección
    } else {
      this.currentSortColumn = column; // Cambia la columna actual
      this.sortDirection = 'asc'; // Reinicia la dirección a ascendente
    }

    // Ordenar los detalles filtrados
    this.filteredDetails.sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0; // Si no son comparables, retorna 0
    });

    // Actualiza los detalles paginados después de ordenar
    this.calculateTotalPages();
    this.updatePaginatedDetails();
  }

  // Método para generar el archivo Excel
  
  generateExcel(): void {
    //window.open(this.detailService.urlExcel, '_blank');

    const enlace = document.createElement('a');
    enlace.href = this.detailService.urlExcel; // URL del archivo
    enlace.download = ''; // Esto sugiere al navegador que debe descargar el archivo
    document.body.appendChild(enlace); // Necesario para algunos navegadores
    enlace.click(); // Simula el clic en el enlace
    document.body.removeChild(enlace); // Limpieza
  }

  // Metodo para ir al front de inventario
  volverInventario(){
    this.router.navigate(["inventario"])
  }
  

  /*
  // Genera el PDF
  generatePDF(): void {
    this.detailService.getPdf().subscribe((pdfArrayBuffer) => {
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'detalle_productos.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
*/
}
