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

  constructor(private supplierService: SuppliersService, private router: Router) { }

  ngAfterViewInit(): void {
    // Cargar la lista inicial de proveedores al cargar la vista
    this.supplierService.searchSuppliers(null, null, null, false).subscribe(data => {
      this.suppliers = data;
      this.filteredSuppliers = data; // Inicializa con todos los proveedores
    });
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
        console.log(data);
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
        // Actualizar la lista de proveedores después de eliminar
        this.suppliers = this.suppliers.filter(supplier => supplier.id !== id);
      },
      error => {
        alert('Ocurrió un error al intentar dar de baja al proveedor.');
      }
    );
    //}
  }
}