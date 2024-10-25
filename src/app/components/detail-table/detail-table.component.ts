import { Component, OnInit, OnDestroy } from '@angular/core';
import { DetailServiceService } from '../../services/detail-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import { Details, PostDecrement } from '../../models/details';

@Component({
  selector: 'app-detail-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detail-table.component.html',
  styleUrls: ['./detail-table.component.css'],
})
export class DetailTableComponent implements OnInit, OnDestroy {
  details: Details[] = [];
  private table: any;
  justificativo: string = '';
  selectedIds: number[] = [];

  constructor(private detailService: DetailServiceService) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails(): void {
    this.detailService.getDetails().subscribe({
      next: (details) => {
        this.details = details;
        this.initializeDataTable();
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
      },
    });
  }

  initializeDataTable(): void {
    if (this.table) {
      this.table.destroy();
      $('#productTable').empty();
    }

    this.table = $('#productTable').DataTable({
      // Configuración de la tabla
      // Agregar la barra de búsqueda en la parte superior
      layout: {
        topStart: 'search',
        topEnd: null,
      },

      data: this.details,
      columns: [
        { data: 'description', title: 'Descripción' },
        { data: 'supplierName', title: 'Nombre del Proveedor' },
        { data: 'state', title: 'Estado' },
        {
          data: 'price',
          title: 'Precio',
          className: 'text-end',
          render: (data: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(data);
          },
        },
        {
          data: null,
          title: 'Seleccionar',
          className: 'text-center',
          render: (data: any, type: any, row: any, meta: any) => {
            return `<input type="checkbox" class="form-check-input selection-checkbox" data-id="${data.id}" />`;
          },
        },
      ],
      pageLength: 10, // Fijamos la cantidad de registros por página en 10
      lengthChange: false, // Deshabilita el selector de cantidad de registros
      language: {
        search: 'Buscar:', // Traducción del texto de búsqueda
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros', // Texto de información
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior',
        },
      },
    });

    // Agregar evento de selección de checkbox
    $('#productTable').on('change', '.selection-checkbox', (event) => {
      const checkbox = event.target as HTMLInputElement;
      const id = parseInt(checkbox.getAttribute('data-id') || '0', 10);
      this.toggleSelection(id);
    });
  }

  toggleSelection(id: number): void {
    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      this.selectedIds.splice(index, 1);
    } else {
      this.selectedIds.push(id);
    }
    this.updateDeleteButtonState();
  }

  updateDeleteButtonState(): void {
    const deleteButton = document.querySelector(
      '#deleteButton'
    ) as HTMLButtonElement;
    if (deleteButton) {
      deleteButton.disabled =
        this.selectedIds.length === 0 || this.justificativo.trim() === '';
    }
  }

  deleteSelected(): void {
    if (this.selectedIds.length > 0 && this.justificativo.trim() !== '') {
      const postDecrement: PostDecrement = {
        justify: this.justificativo,
        ids: this.selectedIds,
      };

      this.detailService.postDecrement(postDecrement).subscribe({
        next: (response) => {
          console.log('Productos eliminados con éxito:', response);
          this.loadDetails(); // Recargar la lista de detalles
          this.resetSelectionAndJustification();
        },
        error: (err) => {
          console.error('Error al eliminar productos:', err);
          this.loadDetails(); // Recargar la lista de detalles
          this.resetSelectionAndJustification();
        },
      });
    } else {
      console.error(
        'No se pueden eliminar productos sin seleccionarlos o sin justificativo.'
      );
      this.loadDetails(); // Recargar la lista de detalles
      this.resetSelectionAndJustification();
    }
  }

  resetSelectionAndJustification(): void {
    this.selectedIds = [];
    this.justificativo = '';
    this.updateDeleteButtonState();
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  // Implementa los métodos que faltan
  volverInventario(): void {
    // Implementa la lógica para volver al inventario
  }

  generateExcel(): void {
    // Implementa la lógica para generar Excel
  }

  generatePDF(): void {
    // Implementa la lógica para generar PDF
  }
}
