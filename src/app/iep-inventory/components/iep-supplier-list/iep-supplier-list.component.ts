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

@Component({
  selector: 'app-iep-supplier-list',
  standalone: true,
  imports: [iepBackButtonComponent, FormsModule, CommonModule, RouterModule, SupplierTypePipe],
  templateUrl: './iep-supplier-list.component.html',
  styleUrls: ['./iep-supplier-list.component.css']
})
export class IepSupplierListComponent implements AfterViewInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  name: string = "";
  type: string = "";
  date: any = null;
  autorized: boolean = false;
  selectedSupplierId: number | null = null;
  tableInitialized = false;
  dataTableInstance: any;

  constructor(private supplierService: SuppliersService, private router: Router) { }

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Proveedores', 10, 10);

    const dataToExport = this.suppliers.map((supplier) => [
      supplier.name,
      supplier.healthInsurance,
      supplier.authorized ? 'Sí' : 'No',
      supplier.address,
      supplier.supplierType,
      supplier.description,
      supplier.email,
      supplier.phoneNumber,
      supplier.discontinued ? 'Sí' : 'No',
    ]);

    (doc as any).autoTable({
      head: [['Nombre', 'Seguro de Salud', 'Autorizado', 'Dirección', 'Tipo de Proveedor', 'Descripción', 'Correo Electrónico', 'Número de Teléfono', 'Descontinuado']],
      body: dataToExport,
      startY: 20,
    });

    doc.save('Lista_Proveedores.pdf');
  }

  exportToExcel(): void {
    const dataToExport = this.suppliers.map((supplier) => ({
      'Nombre': supplier.name,
      'Seguro de Salud': supplier.healthInsurance,
      'Autorizado': supplier.authorized ? 'Sí' : 'No',
      'Dirección': supplier.address,
      'Tipo de Proveedor': supplier.supplierType,
      'Descripción': supplier.description,
      'Correo Electrónico': supplier.email,
      'Número de Teléfono': supplier.phoneNumber,
      'Descontinuado': supplier.discontinued ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Proveedores');

    XLSX.writeFile(workbook, 'Lista_Proveedores.xlsx');
  }


  ngAfterViewInit(): void {

    // Cargar la lista inicial de proveedores al cargar la vista
    this.supplierService.searchSuppliers(null, null, null, false).subscribe(data => {
      this.suppliers = data;
      this.filteredSuppliers = data; // Inicializa con todos los proveedores
      this.updateDataTable(data);
    });
    this.initializeDataTable();
  }

  ngAfterViewChecked(): void {
    // Asegurarse de que la tabla solo se inicialice una vez
    if (!this.tableInitialized && this.suppliers.length > 0) {
      this.initializeDataTable();
    }
  }

  initializeDataTable(): void {
    const self = this; // Guardar referencia al componente
    $(document).ready(() => {
      this.dataTableInstance = $('#suppliersTable').DataTable({
        dom:
          '<"mb-3"t>' +                           //Tabla
          '<"d-flex justify-content-between"lp>', //Paginacion
        data: this.filteredSuppliers,
        columns: [
          { data: 'name', title: 'Razón social' },
          {
            data: 'supplierType',
            title: 'Tipo proveedor',
            render: (data: string) => {
              switch (data) {
                case 'OTHER':
                  return 'OTRO';
                case 'OUTSOURCED_SERVICE':
                  return 'SERVICIO TERCERIZADO';
                case 'INVENTORY_SUPPLIER':
                  return 'PROVEEDOR DE INVENTARIO';
                default:
                  return data;
              }
            }
          },
          { data: 'address', title: 'Dirección' },
          { data: 'healthInsurance', title: 'Obra Social' },
          { data: 'description', title: 'Descripción' },
          { data: 'phoneNumber', title: 'Teléfono' },
          { data: 'email', title: 'Email' },
          {
            data: null,
            title: 'Acciones',
            render: (data: any, type: any, row: any) => {
              return `
                <div class="dropdown">
                  <a class="btn btn-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" 
                     style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; line-height: 1; padding: 0;">
                    &#8942;
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li><a class="dropdown-item edit-btn" href="#" data-supplier-id="${data.id}">Editar</a></li>
                    <li><a class="dropdown-item delete-btn" href="#" data-bs-toggle="modal" data-bs-target="#deleteModal" data-supplier-id="${data.id}">Eliminar</a></li>
                  </ul>
                </div>`;
            }
          }
        ],
        pageLength: 10,
        lengthChange: true, // Permitir que el usuario cambie el número de filas mostradas
        lengthMenu: [10, 25, 50],
        searching: false,
        destroy: true,
        language: {
          lengthMenu: '_MENU_', // Esto eliminará el texto "entries per page"
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ proveedores",
          paginate: {
            first: '<<',
            last: '>>',
            next: '>',
            previous: '<',
          },

          emptyTable: "No hay datos disponibles en la tabla",
        },
        drawCallback: function() {
          // Agregar event listeners después de cada redibujado de la tabla
          $('.edit-supplier').off('click').on('click', function(e) {
            e.preventDefault();
            const supplierId = $(this).data('supplier-id');
            self.updateSupplier(supplierId);
          });
  
          $('.delete-supplier').off('click').on('click', function(e) {
            e.preventDefault();
            const supplierId = $(this).data('supplier-id');
            if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
              self.deleteSupplier(supplierId);
            }
          });
        }
      });
      this.tableInitialized = true;
    });
  }

  loadSuppliers(): void {
    this.supplierService.searchSuppliers(null, null, null, false).subscribe(data => {
      this.suppliers = data;
      this.filteredSuppliers = data;
      if (!this.tableInitialized) {
        this.initializeDataTable();
      } else {
        this.updateDataTable(data);
      }
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
    this.confirmDelete();
  }

  confirmDelete(): void {

    if (this.selectedSupplierId !== null) {
      this.deleteSupplier(this.selectedSupplierId);
      this.selectedSupplierId = null;
    }
  }

  searchSuppliers() {
    this.supplierService.searchSuppliers(this.name, this.type, this.date, this.autorized).subscribe(
      data => {
        this.suppliers = data;
        this.updateDataTable(data);
      }
    );
  }

  updateSupplier(id: number) {

    //const confirmUpdate = window.confirm('¿Está seguro de que desea modificar este proveedor?');
    //if (confirmUpdate) {
    this.router.navigate(['/supplier-update', id]);
    //}
  }
  deleteSupplier(id: number): void {
    this.supplierService.deleteSupplier(id).subscribe({
      next: () => {
        this.loadSuppliers(); // Recargar la lista después de eliminar
      },
      error: (err) => {
        console.error('Error al eliminar el proveedor:', err);
        alert('Ocurrió un error al intentar dar de baja al proveedor.');
      }
    });
  }


  goBack() {
    window.history.back();
  }




}