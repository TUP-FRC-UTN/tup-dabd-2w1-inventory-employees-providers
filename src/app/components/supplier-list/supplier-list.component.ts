import { Component, AfterViewInit } from '@angular/core';
import { BotonVolverComponent } from "../boton-volver/boton-volver.component";
import { Supplier } from '../../models/suppliers';
import { SuppliersService } from '../../services/suppliers.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SupplierTypePipe } from '../../pipes/supplier-type.pipe';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [BotonVolverComponent, FormsModule, CommonModule, RouterModule, SupplierTypePipe],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements AfterViewInit {
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
    $(document).ready(() => {
      this.dataTableInstance = $('#suppliersTable').DataTable({
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
                <button type="button" class="btn btn-primary btn-modificar" data-id="${data.id}">Modificar</button>
                <button type="button" class="btn btn-danger btn-delete" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${data.id}">Eliminar</button>
              `;
            }
          }
        ],
        pageLength: 10,
        lengthChange: false,
        searching: true,
        destroy: true,
        language: {
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ proveedores",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
          },
          emptyTable: "No hay datos disponibles en la tabla",
        }
      });
  

      $('#suppliersTable tbody').on('click', '.btn-delete', (event) => {
        const id = $(event.currentTarget).data('id');
        this.setSupplierToDelete(id);
      });
  

      $('#suppliersTable tbody').on('click', '.btn-modificar', (event) => {
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
    //const isConfirmed = window.confirm('¿Seguro que desea dar de baja al proveedor seleccionado?');
    //if (isConfirmed) {
    this.supplierService.deleteSupplier(id).subscribe(
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
    );
    //}
  }
}