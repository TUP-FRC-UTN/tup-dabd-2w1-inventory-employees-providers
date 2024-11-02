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
  private table: any;
  isCreateModalOpen = false;
  isEditModalOpen = false;
  searchTerm: string = '';
  filteredData: ChargeResponse[] = [];

  modoEdicion = false;
  isModalVisible = false;
  isConfirmModalVisible = false;
  isModalOpen: boolean = false;
  showInfoModal:boolean= false;
  isConfirmDeleteModalOpen = false;
  isErrorModalOpen = false;
  errorMessage = '';


  constructor(
    private fb: FormBuilder,
    private cargoService: ChargeService,
  ) {
    this.cargoForm = this.fb.group({
      charge: ['', Validators.required],
      description: ['', Validators.required]
    });
  }
  
  exportToPdf(): void {
    // Usar filteredData en lugar de cargos
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Cargos', 10, 10);
  
    const dataToExport = this.filteredData.map((cargo) => [
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
    // Usar filteredData en lugar de cargos
    const dataToExport = this.filteredData.map((cargo) => ({
      'Cargo': cargo.charge,
      'Descripción': cargo.description,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Cargos');
  
    XLSX.writeFile(workbook, 'Lista_Cargos.xlsx');
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
        confirmButtonText: 'Aceptar'  // Solo un botón de "Aceptar" en caso de eliminación exitosa
        ,confirmButtonColor: '#3085d6'
      });
      this.loadCargos();
    },
    error: (err) => {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al eliminar el cargo.',
        icon: 'error',
        confirmButtonText: 'Aceptar' , // Solo un botón de "Aceptar" en caso de error
        confirmButtonColor: '#3085d6'
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
        Swal.fire({
          title: 'Error',
          text: `El cargo "${chargeValue}" ya existe. Por favor, elige otro nombre.`,
          icon: 'error',
          confirmButtonText: 'Aceptar'  // Solo un botón de "Aceptar" en caso de error
        }).then(() => {
          this.cerrarModal();  // Cerrar el modal solo después de que se haya mostrado el SweetAlert
        });
        return;
      }

      if (this.modoEdicion) {
        if (this.selectedCargo) {
          // Muestra un SweetAlert de confirmación antes de actualizar
          Swal.fire({
            title: 'Confirmar',
            text: '¿Estás seguro de que deseas actualizar este cargo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (this.selectedCargo) {
              this.cargoService.updateCargo(this.selectedCargo.id, this.cargoForm.value).subscribe({
                next: () => {
                  this.loadCargos();
                  Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El cargo ha sido actualizado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'  // Solo un botón de "Aceptar" para éxito de actualización
                  }).then(() => {
                    this.cerrarModal();  // Cerrar el modal solo después de que se haya mostrado el SweetAlert
                  });
                },
                error: (err) => {
                  Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al actualizar el cargo.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'  // Solo un botón de "Aceptar" en caso de error
                  }).then(() => {
                    this.cerrarModal();  // Cerrar el modal solo después de que se haya mostrado el SweetAlert
                  });
                }
              });
            }
          });
        }
      } else {
        // Crear nuevo cargo
        this.cargoService.createCargo(this.cargoForm.value).subscribe({
          next: () => {
            this.loadCargos();
            Swal.fire({
              title: '¡Creado!',
              text: 'El cargo ha sido creado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'  // Solo un botón de "Aceptar" para éxito de creación
            }).then(() => {
              this.cerrarModal();  // Cerrar el modal solo después de que se haya mostrado el SweetAlert
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al crear el cargo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'  // Solo un botón de "Aceptar" en caso de error
            }).then(() => {
              this.cerrarModal();  // Cerrar el modal solo después de que se haya mostrado el SweetAlert
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
            confirmButtonText: 'Aceptar',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al modificar el cargo.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
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




  // Modal management methods
  openCreateModal(): void {
    this.cargoForm.reset();
    this.isCreateModalOpen = true;
    document.body.classList.add('modal-open');
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    document.body.classList.remove('modal-open');
    this.cargoForm.reset();
  }

  openEditModal(cargo: ChargeResponse): void {
    this.selectedCargo = cargo;
    this.cargoForm.patchValue({
      charge: cargo.charge,
      description: cargo.description
    });
    this.isEditModalOpen = true;
    document.body.classList.add('modal-open');
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    document.body.classList.remove('modal-open');
    this.cargoForm.reset();
    this.selectedCargo = null;
  }

  // Keep your existing methods for table management, export, etc.
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
          '<"mb-3"t>' +
          '<"d-flex justify-content-between"lp>',
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
        this.openEditModal(cargo);
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

  onSubmitCreate(): void {
    if (this.cargoForm.valid) {
      const chargeValue = this.cargoForm.get('charge')?.value;

      this.cargoService.getAllCargos().subscribe(cargos => {
        const exists = cargos.some(cargo => cargo.charge === chargeValue);

        if (exists) {
          this.closeCreateModal();
          Swal.fire({
            title: 'Error',
            text: `El cargo "${chargeValue}" ya existe. Por favor, elige otro nombre.`,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          });
          return;
        }

        this.cargoService.createCargo(this.cargoForm.value).subscribe({
          next: () => {
            this.closeCreateModal();
            Swal.fire({
              title: '¡Creado!',
              text: 'El cargo ha sido creado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3085d6',
              showConfirmButton: true,
              showCancelButton: false
            }).then(() => {
              this.loadCargos();
            });
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al crear el cargo.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3085d6'
            });
          }
        });
      });
    }
  }

  onSubmitEdit(): void {
    if (this.cargoForm.valid && this.selectedCargo?.id) {
      const chargeValue = this.cargoForm.get('charge')?.value;
      const selectedCargoId = this.selectedCargo.id;

      this.cargoService.getAllCargos().subscribe(cargos => {
        const exists = cargos.some(cargo => 
          cargo.charge === chargeValue && cargo.id !== selectedCargoId
        );

        if (exists) {
          this.closeEditModal();
          Swal.fire({
            title: 'Error',
            text: `El cargo "${chargeValue}" ya existe. Por favor, elige otro nombre.`,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          });
          return;
        }

        // Primero mostrar confirmación
        Swal.fire({
          title: '¿Confirmar cambios?',
          text: `¿Deseas actualizar el cargo "${chargeValue}"?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.cargoService.updateCargo(selectedCargoId, this.cargoForm.value).subscribe({
              next: () => {
                this.closeEditModal();
                // Después mostrar éxito con solo botón Aceptar
                Swal.fire({
                  title: '¡Actualizado!',
                  text: 'El cargo ha sido actualizado correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  showCancelButton: false,
                  confirmButtonColor: '#3085d6'
                }).then(() => {
                  this.loadCargos();
                });
              },
              error: () => {
                Swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al actualizar el cargo.',
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#3085d6'
                });
              }
            });
          }
        });
      });
    }
  }

}

