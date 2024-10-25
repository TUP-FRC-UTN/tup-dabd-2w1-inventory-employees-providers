import { Component, OnInit, OnDestroy } from '@angular/core';
import { DetailServiceService } from '../../services/detail-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import { Details, PostDecrement } from '../../models/details';
declare var bootstrap: any;
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  private deleteModal: any;

  constructor(private detailService: DetailServiceService) {}

  ngOnInit(): void {
    this.loadDetails();
    this.initializeModal();
  }

  initializeModal(): void {
    this.deleteModal = new bootstrap.Modal(
      document.getElementById('confirmDeleteModal')
    );
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
      //dom: '<"d-flex justify-content-between align-items-center mb-3"<"d-flex align-items-center gap-2"f><"select-all-wrapper">>rt<"d-flex justify-content-end"p>',
      //dom: '<"d-flex justify-content-between align-items-center mb-3"f<"select-all-wrapper">>rt<"d-flex justify-content-end"p>', // Paginación a la derecha
      layout: {
        topStart: 'search',
        topEnd: null
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
          render: (data: any) => {
            const isChecked = this.selectedIds.includes(data.id)
              ? 'checked'
              : '';
            return `<input type="checkbox" class="form-check-input selection-checkbox" data-id="${data.id}" ${isChecked} />`;
          },
        },
      ],
      pageLength: 10,
      lengthChange: false,
      language: {
        
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        emptyTable: 'No se encontraron registros', // Mensaje personalizado si no hay datos   
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior',
        },
      },
      initComplete: function () {
        // Agregar el checkbox "Seleccionar todos" después de que DataTable se inicialice
        $('.select-all-wrapper').html(`
          <div class="form-check ms-3">
            <input class="form-check-input" type="checkbox" id="selectAll">
            <label class="form-check-label" for="selectAll">
              Seleccionar todos
            </label>
          </div>
        `);
      }
    });

    // Agregar el evento al checkbox después de que se cree
    $(document).on('change', '#selectAll', (event) => {
      this.toggleSelectAll(event);
    });

    $('#productTable').on('change', '.selection-checkbox', (event) => {
      const checkbox = event.target as HTMLInputElement;
      const id = parseInt(checkbox.getAttribute('data-id') || '0', 10);
      this.toggleSelection(id);
    });

    // Actualizar checkboxes cuando cambia la página
    this.table.on('draw', () => {
      this.updateCheckboxStates();
      // Actualizar el estado del checkbox "Seleccionar todos"
      const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = this.areAllSelected();
      }
    });
  }

  // Nuevo método para actualizar el estado visual de los checkboxes
  updateCheckboxStates(): void {
    $('.selection-checkbox').each((index: number, element: HTMLElement) => {
      const checkbox = element as HTMLInputElement;
      const id = parseInt(checkbox.getAttribute('data-id') || '0', 10);
      checkbox.checked = this.selectedIds.includes(id);
    });
  }

  areAllSelected(): boolean {
    return (
      this.details.length > 0 && this.selectedIds.length === this.details.length
    );
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedIds = this.details.map((detail) => detail.id);
    } else {
      this.selectedIds = [];
    }
    // Actualizar los checkboxes visualmente
    this.updateCheckboxStates();
  }

  toggleSelection(id: number): void {
    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      this.selectedIds.splice(index, 1);
    } else {
      this.selectedIds.push(id);
    }
  }

  confirmDelete(): void {
    if (this.selectedIds.length > 0 && this.justificativo.trim() !== '') {
      const postDecrement: PostDecrement = {
        justify: this.justificativo,
        ids: this.selectedIds,
      };

      this.detailService.postDecrement(postDecrement).subscribe({
        next: (response) => {
          console.log('Productos eliminados con éxito:', response);
          // Primero ocultamos el modal
          this.deleteModal.hide();
          // Removemos manualmente el backdrop y las clases modal-open
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          // Luego recargamos los datos y reseteamos
          this.loadDetails();
          this.resetSelectionAndJustification();
        },
        error: (err) => {
          console.error('Error al eliminar productos:', err);
          // Misma limpieza en caso de error
          this.deleteModal.hide();
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          this.loadDetails();
          this.resetSelectionAndJustification();
        },
      });
    }
  }

  resetSelectionAndJustification(): void {
    this.selectedIds = [];
    this.justificativo = '';
    // Actualizar el estado visual de los checkboxes
    this.updateCheckboxStates();
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  volverInventario(): void {
    // Implementa la lógica para volver al inventario
  }

// Método para exportar a Excel
generateExcel(): void {
  const dataToExport = this.details.map(detail => ({
    Descripción: detail.description,
    'Nombre del Proveedor': detail.supplierName,
    Estado: detail.state,
    Precio: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(detail.price),
  }));

  // Crear un libro de Excel
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalles de Productos');

  // Guardar el archivo
  XLSX.writeFile(workbook, 'Listado_Productos.xlsx');
}

// Método para exportar a PDF
generatePDF(): void {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Listado de Productos', 10, 10);

  const dataToExport = this.details.map(detail => [
    detail.description,
    detail.supplierName,
    detail.state,
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(detail.price),
  ]);

  // Añadir la tabla al PDF
  (doc as any).autoTable({
    head: [['Descripción', 'Nombre del Proveedor', 'Estado', 'Precio']],
    body: dataToExport,
    startY: 20,
  });

  // Guardar el PDF
  doc.save('Listado_Productos.pdf');
}
}
