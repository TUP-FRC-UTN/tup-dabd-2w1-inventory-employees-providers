import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChargeResponse } from '../../Models/charge-response';
import { ChargeService } from '../../services/charge.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-iep-cargos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './iep-charges.component.html',
  styleUrl: './iep-charges.component.css'
})
export class IepChargesComponent implements OnInit, OnDestroy, AfterViewInit {
  cargoForm: FormGroup;
  cargos: ChargeResponse[] = [];
  selectedCargo: ChargeResponse | null = null;
  modoEdicion = false;
  private table: any;
  isModalVisible = false;
  isConfirmModalVisible = false;
  isModalOpen: boolean = false;
  showInfoModal:boolean= false;
  isConfirmDeleteModalOpen = false;
  isErrorModalOpen = false;
  errorMessage = '';

  searchTerm: string = '';
  filteredData: ChargeResponse[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(ChargeService) private cargoService: ChargeService,
  ) {
    this.cargoForm = this.fb.group({
      charge: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Cargos', 10, 10);

    const dataToExport = this.cargos.map((cargo) => [
      cargo.charge,
      cargo.description,
    ]);

    (doc as any).autoTable({
      head: [['Cargo', 'Descripción']],
      body: dataToExport,
      startY: 20,
    });

    doc.save('Lista_Cargos.pdf');
  }

  exportToExcel(): void {
    const dataToExport = this.cargos.map((cargo) => ({
      'Cargo': cargo.charge,
      'Descripción': cargo.description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Cargos');

    XLSX.writeFile(workbook, 'Lista_Cargos.xlsx');
  }


  ngOnInit(): void {
    this.loadCargos();
  }

  
  filterData(event: any): void {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredData = [...this.cargos];
    } else {
      this.filteredData = this.cargos.filter(cargo => 
        cargo.charge.toLowerCase().includes(searchTerm)
      );
    }
    
    this.refreshDataTable();
  }


  loadCargos(): void {
    this.cargoService.getAllCargos().subscribe({
      next: (cargos) => {
        this.cargos = cargos;
        this.filteredData = [...cargos];
        this.refreshDataTable();
      },
      error: (err) => {
        console.error('Error al cargar cargos:', err);
      }
    });
  }

  private refreshDataTable(): void {
    if (this.table) {
      this.table.clear().destroy();
      this.initializeDataTable();
    } else {
      this.initializeDataTable();
    }
  }

  initializeDataTable(): void {
    if (!this.cargos || this.cargos.length === 0) {
      return;
    }

    this.table = $('#cargosTable').DataTable({
      dom:
          '<"mb-3"t>' +                           //Tabla
          '<"d-flex justify-content-between"lp>', //Paginacion
      data: this.filteredData,
      columns: [
        { data: 'charge', title: 'Cargo' },
        { data: 'description', title: 'Descripción' },
        {
          data: null,
          title: 'Acciones',
          orderable: false,
          render: (data: any) => {
            return `
              <div class="dropdown">
                <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" 
                   style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                  &#8942;
                </a>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li><a class="dropdown-item edit-btn" href="#" data-id="${data.id}">Editar</a></li>
                  <li><a class="dropdown-item delete-btn" href="#" data-id="${data.id}">Eliminar</a></li>
                </ul>
              </div>`;
          }
        }
      ],
      pageLength: 10,
      lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
      lengthMenu:[10, 25, 50],
      searching: false, // Desactivar la búsqueda
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

    this.setupTableListeners();
  }

  private setupTableListeners(): void {
    this.table.on('click', '.edit-btn', (event: { preventDefault: () => void; currentTarget: any; }) => {
      event.preventDefault();
      const id = parseInt($(event.currentTarget).data('id'), 10);
      const cargo = this.cargos.find(c => c.id === id);
      if (cargo) {
        this.abrirModalEditar(cargo); // Abre el modal en modo edición
      }
    });
  
    this.table.on('click', '.delete-btn', (event: { preventDefault: () => void; currentTarget: any; }) => {
      event.preventDefault();
      const id = parseInt($(event.currentTarget).data('id'), 10);
      const cargo = this.cargos.find(c => c.id === id);
      if (cargo) {
        this.abrirModalConfirmarEliminacion(cargo);
      }
    });
  }
  


  markAllControlsAsTouched(): void {
    Object.keys(this.cargoForm.controls).forEach(key => {
      this.cargoForm.get(key)?.markAsTouched();
    });
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  resetFilters() {
    this.searchTerm = ''; // Limpiar el término de búsqueda
    this.filteredData = [...this.cargos]; // Restaurar los datos completos
    this.refreshDataTable(); // Refrescar la tabla para mostrar todos los registros
  }
  
  ngAfterViewInit(): void {
    this.initializeDataTable();
    
    // Escuchar eventos del modal
    const modalElement = document.getElementById('modalCargo');
    if (modalElement) {
      modalElement.addEventListener('show.bs.modal', () => {
        this.modoEdicion = false;
        this.selectedCargo = null;
        this.cargoForm.reset();
      });
  
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.cargoForm.reset();
        this.selectedCargo = null;
        this.modoEdicion = false;
      });
    }
  }

abrirModalConfirmarEliminacion(cargo: ChargeResponse): void {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Desea eliminar este cargo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed && cargo.id) {
      this.eliminarCargo(cargo.id);
    }
  });
}

eliminarCargo(id: number): void {
  if (!id) return;

  this.cargoService.updateStatus(id).subscribe({
    next: () => {
      this.cerrarModal();  // Cerrar el modal antes de mostrar el SweetAlert
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El cargo ha sido eliminado correctamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      this.loadCargos();
    },
    error: (err) => {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al eliminar el cargo.',
        icon: 'error'
      });
      console.error('Error al eliminar cargo:', err);
    }
  });
}


onSubmit(): void {
  if (this.cargoForm.valid) {
    const chargeValue = this.cargoForm.get('charge')?.value;

    this.cargoService.getAllCargos().subscribe(cargos => {
      const exists = cargos.some(cargo => 
        cargo.charge === chargeValue && cargo.id !== this.selectedCargo?.id
      );

      if (exists) {
        this.cerrarModal();  // Cerrar el modal antes de mostrar el SweetAlert
        Swal.fire({
          title: 'Error',
          text: `El cargo "${chargeValue}" ya existe. Por favor, elige otro nombre.`,
          icon: 'error'
        });
        return;
      }

      if (this.modoEdicion) {
        if (this.selectedCargo) {
          this.cargoService.updateCargo(this.selectedCargo.id, this.cargoForm.value).subscribe({
            next: () => {
              this.loadCargos();
              this.cerrarModal();  // Cerrar el modal antes de mostrar el SweetAlert
              Swal.fire({
                title: '¡Actualizado!',
                text: 'El cargo ha sido actualizado correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (err) => {
              Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al actualizar el cargo.',
                icon: 'error'
              });
            }
          });
        }
      } else {
        this.cargoService.createCargo(this.cargoForm.value).subscribe({
          next: () => {
            this.loadCargos();
            this.cerrarModal();  // Cerrar el modal antes de mostrar el SweetAlert
            Swal.fire({
              title: '¡Creado!',
              text: 'El cargo ha sido creado correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al crear el cargo.',
              icon: 'error'
            });
          }
        });
      }
    });
  } else {
    this.markAllControlsAsTouched();
  }
}

onModificarCargo(): void {
  if (this.cargoForm.valid) {
    if (this.selectedCargo) {
      this.cargoService.updateCargo(this.selectedCargo.id, this.cargoForm.value).subscribe({
        next: () => {
          this.loadCargos();  // Recargar la lista de cargos
          this.cerrarModal();  // Cerrar el modal
          Swal.fire({
            title: '¡Actualizado!',
            text: 'El cargo ha sido modificado correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al modificar el cargo.',
            icon: 'error'
          });
        }
      });
    }
  } else {
    this.markAllControlsAsTouched();
  }
}


cerrarModal(): void {
  this.isModalOpen = false;
  this.cargoForm.reset();
  this.selectedCargo = null;
  this.modoEdicion = false;

  // Eliminar la clase modal-open de body y el overlay
  document.body.classList.remove('modal-open');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.remove();
  }
}

closeInfoModal(): void{
  this.showInfoModal = false;
}

abrirModalNuevo(): void {
  this.modoEdicion = false; // Modo de creación
  this.selectedCargo = null; // Sin cargo seleccionado
  this.cargoForm.reset(); // Resetea el formulario
  this.isModalOpen = true; // Muestra el modal
  document.body.classList.add('modal-open'); // Añade fondo oscuro
}

abrirModalEditar(cargo: ChargeResponse): void {
  this.modoEdicion = true; // Modo de edición
  this.selectedCargo = cargo; // Carga el cargo seleccionado para edición
  this.cargoForm.patchValue(cargo); // Rellena el formulario con los datos del cargo
  this.isModalOpen = true; // Muestra el modal
  document.body.classList.add('modal-open');
}

onCancel(): void {
  this.cerrarModal();
}


}

