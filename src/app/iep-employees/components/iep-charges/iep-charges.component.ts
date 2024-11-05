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
declare var bootstrap: any; // Añadir esta declaración al principio

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
  selectedStates: any;
  filters = {
    reutilizableSeleccionado: [] as boolean[]
  };


  constructor(
    private fb: FormBuilder,
    private cargoService: ChargeService,
  ) {
    this.cargoForm = this.fb.group({
      charge: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  stateFilter(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value === 'true';
  
    // Añadir o quitar el valor del array de filtros
    if (checkbox.checked) {
      this.filters.reutilizableSeleccionado.push(value);
    } else {
      this.filters.reutilizableSeleccionado = this.filters.reutilizableSeleccionado.filter((v) => v !== value);
    }
  
    // Filtra `filteredData` basándose en `reutilizableSeleccionado`
    if (this.filters.reutilizableSeleccionado.length > 0) {
      this.filteredData = this.cargos.filter((cargo) =>
        this.filters.reutilizableSeleccionado.includes(cargo.active)
      );
    } else {
      this.filteredData = [...this.cargos]; // Restablecer si no hay filtros seleccionados
    }
  
    // Actualizar la tabla después de aplicar el filtro
    if (this.table) {
      this.table.clear().rows.add(this.filteredData).draw();
    }
  }
  
  

  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${day}-${month}-${year}`;
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
  
    const formattedDate = this.getFormattedDate();
    doc.save(`Lista_Cargos_${formattedDate}.pdf`);
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
  
    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `Lista_Cargos_${formattedDate}.xlsx`);
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
      dom: '<"mb-3"t>' +
           '<"d-flex justify-content-between"lp>',
      data: this.filteredData,
      columns: [
        { data: 'charge', title: 'Cargo' },
        { data: 'description', title: 'Descripción' },
        {
          data: 'active',
          title: 'Estado',
          render: (data: boolean) => {
            return data ? 'Activo' : 'Inactivo'; // Muestra "Activo" o "Inactivo" según el valor de `active`
          }
        },
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
                  <li><a class="dropdown-item edit-btn" href="#" data-bs-target="#editChargeModal" data-bs-toggle="modal" data-id="${data.id}">Editar</a></li>
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
  

  closeModale(modalId: string) {
    const modalElement = document.getElementById(modalId);
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
reset():void{
  this.cargoForm.reset();
}

onSubmitCreate(): void {
    if (this.cargoForm.valid) {
        const chargeValue = this.cargoForm.get('charge')?.value;

        this.cargoService.getAllCargos().subscribe(cargos => {
            const exists = cargos.some(cargo => cargo.charge === chargeValue);

            if (exists) {
                Swal.fire({
                    title: 'Error',
                    text: `El cargo "${chargeValue}" ya existe. Por favor, elige otro nombre.`,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    this.closeModale('createChargeModal'); // Cerrar modal en caso de error
                    this.loadCargos();
                });
                return;
            }

            this.cargoService.createCargo(this.cargoForm.value).subscribe({
                next: () => {
                    Swal.fire({
                        title: '¡Creado!',
                        text: 'El cargo ha sido creado correctamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#3085d6',
                    }).then(() => {
                        this.closeModale('createChargeModal'); // Cerrar modal tras éxito
                        this.cargoForm.reset();
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
                    }).then(() => {
                        this.closeModale('createChargeModal'); // Cerrar modal en caso de error
                        this.loadCargos();
                        this.cargoForm.reset();
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
                Swal.fire({
                    title: 'Error',
                    text: `El cargo "${chargeValue}" ya existe. Por favor, elige otro nombre.`,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    this.closeModale('editChargeModal'); // Cerrar modal en caso de error
                    this.loadCargos();
                });
                return;
            }

            // Mostrar confirmación antes de actualizar
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
                            Swal.fire({
                                title: '¡Actualizado!',
                                text: 'El cargo ha sido actualizado correctamente.',
                                icon: 'success',
                                confirmButtonText: 'Aceptar',
                                confirmButtonColor: '#3085d6'
                            }).then(() => {
                                this.closeModale('editChargeModal'); // Cerrar modal tras éxito
                                this.loadCargos();
                                this.cargoForm.reset();
                            });
                        },
                        error: () => {
                            Swal.fire({
                                title: 'Error',
                                text: 'Ocurrió un error al actualizar el cargo.',
                                icon: 'error',
                                confirmButtonText: 'Aceptar',
                                confirmButtonColor: '#3085d6'
                            }).then(() => {
                                this.closeModale('editChargeModal'); // Cerrar modal en caso de error
                                this.loadCargos();
                            });
                        }
                    });
                }
            });
        });
    }
}
}
