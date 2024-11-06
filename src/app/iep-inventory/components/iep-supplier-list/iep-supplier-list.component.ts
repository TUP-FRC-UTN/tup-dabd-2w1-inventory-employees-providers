import { Component, AfterViewInit } from '@angular/core';
import { Supplier } from '../../models/suppliers';
import { SuppliersService } from '../../services/suppliers.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { iepBackButtonComponent } from '../../../common-components/iep-back-button/iep-back-button.component';
import { SupplierTypePipe } from '../../pipes/supplier-type.pipe';

interface SelectedTypes {
  OUTSOURCED_SERVICE: boolean;
  INVENTORY_SUPPLIER: boolean;
  OTHER: boolean;
}

interface SelectedStates {
  ACTIVE: boolean;
  INACTIVE: boolean;
}

@Component({
  selector: 'app-iep-supplier-list',
  standalone: true,
  imports: [iepBackButtonComponent, FormsModule, CommonModule, RouterModule],
  templateUrl: './iep-supplier-list.component.html',
  styleUrls: ['./iep-supplier-list.component.css']
})
export class IepSupplierListComponent implements AfterViewInit {

  selectedStates: SelectedStates = {
    ACTIVE: false,
    INACTIVE: false
  };

  selectedStateCount: number = 0;

  selectedTypes: SelectedTypes = {
    OUTSOURCED_SERVICE: false,
    INVENTORY_SUPPLIER: false,
    OTHER: false
  };

  showFilters: boolean = false;
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];

  // Filtro global
  globalFilter: string = '';

  // Filtros por columna
  columnFilters = {
    name: '',
    supplierType: '',
    address: '',
    cuit: '',
    description: '',
    phoneNumber: '',
    email: ''
  };

  // Método para limpiar todos los filtros
  cleanFilters() {
    this.globalFilter = '';
    Object.keys(this.columnFilters).forEach(key => {
      this.columnFilters[key as keyof typeof this.columnFilters] = '';
    });
    // Limpiar los tipos y estados seleccionados
    Object.keys(this.selectedTypes).forEach(key => {
      this.selectedTypes[key as keyof SelectedTypes] = false;
    });
    Object.keys(this.selectedStates).forEach(key => {
      this.selectedStates[key as keyof SelectedStates] = false;
    });
    this.selectedTypeCount = 0;
    this.selectedStateCount = 0;
    this.filteredSuppliers = [...this.suppliers];
    this.updateDataTable(this.filteredSuppliers);
  }

  selectedTypeCount: number = 0;
  // Método para aplicar todos los filtros
  applyFilters() {
    let filteredData = [...this.suppliers];

    // Aplicar filtro global (excluyendo el tipo de proveedor y estado)
    if (this.globalFilter) {
      const searchTerm = this.globalFilter.toLowerCase();
      filteredData = filteredData.filter(supplier => {
        return Object.entries(supplier).some(([key, value]) => {
          // Excluir supplierType y discontinued del filtro global
          if (key === 'supplierType' || key === 'discontinued') return false;
          return value && value.toString().toLowerCase().includes(searchTerm);
        });
      });
    }

    // Aplicar filtro de tipo de proveedor
    this.selectedTypeCount = Object.values(this.selectedTypes).filter(Boolean).length;
    if (this.selectedTypeCount > 0) {
      filteredData = filteredData.filter(supplier => {
        return this.selectedTypes[supplier.supplierType as keyof SelectedTypes];
      });
    }

    // Aplicar filtro de estado
    this.selectedStateCount = Object.values(this.selectedStates).filter(Boolean).length;
    if (this.selectedStateCount > 0) {
      filteredData = filteredData.filter(supplier => {
        return this.selectedStates[supplier.discontinued ? 'INACTIVE' : 'ACTIVE'];
      });
    }

    // Aplicar filtros por columna
    Object.keys(this.columnFilters).forEach(key => {
      const filterValue = this.columnFilters[key as keyof typeof this.columnFilters];
      if (filterValue) {
        filteredData = filteredData.filter(supplier => {
          const value = supplier[key as keyof Supplier];
          if (key === 'healthInsurance' && typeof filterValue === 'string') {
            return value?.toString().includes(filterValue);
          }
          return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    this.filteredSuppliers = filteredData;
    this.updateDataTable(filteredData);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // Método para manejar la búsqueda de proveedores
  searchSuppliers() {
    this.applyFilters();
  }

  ngAfterViewInit(): void {
    // Cargar la lista inicial de proveedores
    this.supplierService.searchSuppliers(null, null, null, false).subscribe(data => {
      this.suppliers = data;
      this.filteredSuppliers = data;
      this.updateDataTable(data);
    });
    this.initializeDataTable();
  }

  name: string = "";
  type: string = "";
  date: any = null;
  autorized: boolean = false;
  selectedSupplierId: number | null = null;
  tableInitialized = false;
  dataTableInstance: any;
  deleteModal: any;

  constructor(private supplierService: SuppliersService, private router: Router) { }

  getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes desde 0
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  }

  translateSupplierType(type: string): string {
    switch (type) {
      case 'OTHER':
        return 'Otro';
      case 'OUTSOURCED_SERVICE':
        return 'Sservicio Tercerizado';
      case 'INVENTORY_SUPPLIER':
        return 'Proveedor de Inventario';
      default:
        return type;
    }
  }

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Proveedores', 10, 10);

    // Datos a exportar, mapeando los proveedores con los campos específicos
    const dataToExport = this.suppliers.map((supplier) => [
      supplier.name,
      this.translateSupplierType(supplier.supplierType),
      supplier.address,
      supplier.description,
      supplier.phoneNumber,
      supplier.email
    ]);

    // Configuración de la tabla en el PDF
    (doc as any).autoTable({
      head: [['Razón Social', 'Tipo Proveedor', 'Dirección', 'Descripción', 'Teléfono', 'Email']],
      body: dataToExport,
      startY: 20,
    });

    const formattedDate = this.getFormattedDate();
    doc.save(`Lista_Proveedores_${formattedDate}.pdf`);
  }


  exportToExcel(): void {
    const dataToExport = this.suppliers.map((supplier) => ({
      'Razón Social': supplier.name,
      'Tipo Proveedor': this.translateSupplierType(supplier.supplierType),
      'Dirección': supplier.address,
      'Descripción': supplier.description,
      'Teléfono': supplier.phoneNumber,
      'Email': supplier.email
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Proveedores');

    const formattedDate = this.getFormattedDate();
    XLSX.writeFile(workbook, `Lista_Proveedores_${formattedDate}.xlsx`);
  }

  ngAfterViewChecked(): void {
    // Asegurarse de que la tabla solo se inicialice una vez
    if (!this.tableInitialized && this.suppliers.length > 0) {
      this.initializeDataTable();
    }
  }

  initializeDataTable(): void {
    $(document).ready(() => {
      this.dataTableInstance = $('#suppliersTable').DataTable({
        dom:
          '<"mb-3"t>' +                           //Tabla
          '<"d-flex justify-content-between"lp>', //Paginacion
        data: this.filteredSuppliers,
        columns: [
          { data: 'cuit', title: 'Cuit' },
          { data: 'name', title: 'Nombre' },
          {
            data: 'supplierType',
            title: 'Tipo proveedor',
            render: (data: string) => {
              let colorClass;
              switch (data) {
                case 'OTHER':
                  return '<span class="badge" style="background-color: #dc3545;">Otro</span>'
                case 'OUTSOURCED_SERVICE':
                  return '<span class="badge" style="background-color: #ffc107;">Servicio Tercerizado</span>'
                case 'INVENTORY_SUPPLIER':
                  return '<span class="badge" style="background-color: #0d6efd;">Proveedor de Inventario</span>'
                default:
                  return data;
              }
            },
          },
          
          { data: 'address', title: 'Dirección' },

          { data: 'phoneNumber', title: 'Teléfono' },
          { data: 'email', title: 'Email' },
          {
            data: 'discontinued',
            title: 'Estado',
            render: (data: boolean) => {
              return data 
                ? '<span class="badge" style="background-color: #dc3545;">Inactivo</span>' 
                : '<span class="badge" style="background-color: #28a745;">Activo</span>'
            }
          },
          
          {
            data: null,
            title: 'Acciones',
            render: (data: any, type: any, row: any) => {
              return `
                <div class="d-flex justify-content-center">
                  <div class="dropdown">
                  <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" 
                     style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                    &#8942;
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li><a class="dropdown-item edit-btn" href="#" data-id="${data.id}">Editar</a></li>
                    <li class="dropdown-divider"></li>
                    <li><a class="dropdown-item delete-btn" href="#" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${data.id}">Eliminar</a></li>
                  </ul>
                </div>

                </div>
                
                `;
            }
          }
        ],
        pageLength: 5,
        lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
        lengthMenu: [5, 10, 25, 50],
        searching: false,
        destroy: true,
        language: {
          lengthMenu: '_MENU_', // Esto eliminará el texto "entries per page"
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ proveedores",

          emptyTable: "No hay datos disponibles en la tabla",
        }
      });


      // Actualizar los event listeners
      $('#suppliersTable tbody').on('click', '.delete-btn', (event) => {
        event.preventDefault();
        const id = $(event.currentTarget).data('id');
        this.setSupplierToDelete(id);
        this.deleteModal.show(); // Mostrar el modal usando la instancia
      });

      $('#suppliersTable tbody').on('click', '.edit-btn', (event) => {
        event.preventDefault(); // Prevenir navegación por defecto
        const id = $(event.currentTarget).data('id');
        this.updateSupplier(id);
      });

      this.tableInitialized = true;
    });
  }



  updateDataTable(newSuppliers: any[]): void {
    if (this.dataTableInstance) {
      this.dataTableInstance.clear();
      this.dataTableInstance.rows.add(newSuppliers);
      this.dataTableInstance.draw();
    }
  }

  setSupplierToDelete(id: number): void {
    this.selectedSupplierId = id;
  }

  confirmDelete(): void {
    if (this.selectedSupplierId !== null) {
      this.supplierService.deleteSupplier(this.selectedSupplierId).subscribe({
        next: (response) => {
          console.log('Proveedor eliminado:', response);
          this.suppliers = this.suppliers.filter(supplier => supplier.id !== this.selectedSupplierId);
          this.updateDataTable(this.suppliers);
          this.selectedSupplierId = null;
          this.deleteModal.hide(); // Ocultar el modal después de eliminar
        },
        error: (error) => {
          console.error('Error al eliminar el proveedor', error);
          alert('Ocurrió un error al intentar dar de baja al proveedor.');
          this.deleteModal.hide();
        }
      });
    }
  }

  updateSupplier(id: number) {

    //const confirmUpdate = window.confirm('¿Está seguro de que desea modificar este proveedor?');
    //if (confirmUpdate) {
    this.router.navigate(['/home/supplier-update', id]);
    //}
  }

  deleteSupplier(id: number): void {
    //const isConfirmed = window.confirm('¿Seguro que desea dar de baja al proveedor seleccionado?');
    //if (isConfirmed) {
    /*this.supplierService.deleteSupplier(id).subscribe(
      response => {
        //alert('¡Proveedor dado de baja correctamente!');
        console.log(response);
        // Actualizar la lista de proveedores después de eliminar
        this.suppliers = this.suppliers.filter(supplier => supplier.id !== id);
        this.updateDataTable(this.suppliers);
      },
      error => {
        alert('Ocurrió un error al intentar dar de baja al proveedor.');
      }
    );*/
    this.supplierService.deleteSupplier(id).subscribe({
      next: (response) => {
        //alert('¡Proveedor dado de baja correctamente!');
        console.log(response);
        // Actualizar la lista de proveedores después de eliminar
        this.suppliers = this.suppliers.filter(supplier => supplier.id !== id);
        this.updateDataTable(this.suppliers);
      },
      error: (error) => {
        console.error('Error al eliminar el proveedor', error);
        alert('Ocurrió un error al intentar dar de baja al proveedor.');
      }
    }
    );
    //}
  }

  goBack() {
    window.history.back();
  }




}