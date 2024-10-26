import { Component } from '@angular/core';
import { BotonVolverComponent } from "../boton-volver/boton-volver.component";
import { Supplier } from '../../models/suppliers';
import { SuppliersService } from '../../services/suppliers.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [BotonVolverComponent,FormsModule,CommonModule,RouterModule],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.css'
})
export class SupplierListComponent {
searchSuppliers() {
  
  this.supplierService.searchSuppliers(this.name, this.type, this.date, this.autorized).subscribe(
    data=>{
      this.suppliers = data;
      console.log(data);
      this.updateDataTable(data);
    }
  )
}
  suppliers :Supplier[] = [];
  name: string="";
  type: string="";
  date: any=null;
  autorized: boolean = false;
  tableInitialized = false;
  dataTableInstance: any;
  ngAfterViewInit(): void {
    // Inicializar la tabla cuando se carga la vista
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
        data: this.suppliers,
        columns: [
          { data: 'name', title: 'Razon social' },
          { data: 'supplierType', title: 'Tipo proveedor' },
          { data: 'address', title: 'Direccion' },
          { data: 'healthInsurance', title: 'Obra Social' },
          { data: 'description', title: 'Descripcion' },
          { data: 'phoneNumber', title: 'Telefono' },
          { data: 'email', title: 'Email' },
          {
            data: null,
            title: 'Acciones',
            render: (data: any, type: any, row: any) => {
              return `
                <button type="button" class="btn btn-primary">Modificar</button>
                <button type="button" class="btn btn-danger">Eliminar</button>
              `;
            }
          }
        ],
        pageLength: 10,
        lengthChange: false,
        searching: true,
        destroy: true, // Destruye la tabla existente antes de volver a crearla
        language: {
          search: "Buscar:",
          info: "Mostrando _START_ a _END_ de _TOTAL_ proveedores",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
          },
        }
      });
      this.tableInitialized = true;
    });
  }

  // Método para actualizar los datos de la tabla
  updateDataTable(newSuppliers: any[]): void {
    if (this.dataTableInstance) {
      // Limpiar los datos anteriores
      this.dataTableInstance.clear();
      // Agregar los nuevos datos
      this.dataTableInstance.rows.add(newSuppliers);
      // Dibujar la tabla para actualizar la vista
      this.dataTableInstance.draw();
    }
  }

  constructor(private supplierService: SuppliersService,private router:Router) {
    this.supplierService.searchSuppliers(null, null, null,false).subscribe(
      data=>{
        this.suppliers = data;
        this.updateDataTable(data);
        
      }
    )
  }

  updateSupplier(id:number){


      console.log("queres modificarrrrrrrrrrrrr")
    
       this.router.navigate(['/supplier-update',id]);
     
    
  }

  deleteSupplier(id: number): void {
    const isConfirmed = window.confirm('¿Seguro que desea dar de baja al proveedor seleccionado?');
    
    if (isConfirmed) {
      this.supplierService.deleteSupplier(id).subscribe(
        response => {
          alert('¡Proveedor dado de baja correctamente!');
        },
        error => {
          alert('Ocurrió un error al intentar dar de baja al proveedor.');
        }
      );
    }
  }
  
}
