import { Routes } from '@angular/router';
import { EmpListadoEmpleadosComponent } from './components/emp-listado-empleados/emp-listado-empleados.component';
import { DetailTableComponent } from './components/detail-table/detail-table.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { StockAumentoComponent } from './components/stock-aumento/stock-aumento.component';
import { TablaComponent } from './components/tabla/tabla.component';
import { ProductComponent } from './components/product/product.component';
import { IepRegisterWarehouseComponent } from './components/iep-register-warehouse/iep-register-warehouse.component';
import { FormLlamadoAtencionComponent } from './components/form-llamado-atencion/form-llamado-atencion.component';
import { WarehouseMovementSearchComponent } from './components/warehouse-movement-search/warehouse-movement-search.component';
import { PerformancelistComponent } from './components/performancelist/performancelist.component';
import { SuppliersFormComponent } from './components/suppliers-form/suppliers-form.component';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
import { SupplierUpdateComponent } from './components/supplier-update/supplier-update.component';
import { IEPFormPostEmployeesComponent } from './components/iep-form-post-employees/iep-form-post-employees.component';
import { IepCargosComponent } from './components/iep-cargos/iep-cargos.component';
import { EmpPutEmployeesComponent } from './components/iep-put-employees/emp-put-employees.component';
export const routes: Routes = [
    {
        path: 'stock-aumento',  // SANTI
        component: StockAumentoComponent,
        title: 'Aumento de stock'
    },
    {
        path: 'registro-productos', // TOMAS
        component: ProductComponent,
        title: 'Registro de productos'
    },
    {
        path: 'inventario',     // AGUSTIN
        component: InventarioComponent,
        title: 'Inventario'
    },
    {
        path: 'detalle-inventario',     // MARTIN
        component: DetailTableComponent,
        title: 'Detalle de inventario'
    },
    {
        path: 'historial-modificaciones-stock',     // ENZO
        component: TablaComponent,
        title: 'Historial de modificacion de stock'
    },
    {
        path: 'listado-empleados',     // ENZO
        component: EmpListadoEmpleadosComponent,
        title: 'Listado de empleados'
    },
    {
        path: 'wake-up-call',
        component: FormLlamadoAtencionComponent,
        title: 'Llamada de atención'
    },
    {
        path: 'warehouse-movements',
        component: WarehouseMovementSearchComponent,
        title: 'Ver almacenes'
    },
    {
        path: 'desempeño',
        component: PerformancelistComponent,
        title: 'desempeño'
    },

    {
        path: "suppliers",
        component: SupplierListComponent,
        title: "proveedores"
    },
    {
        path: "create-supplier",
        component: SuppliersFormComponent,
        title: "Crear proveedor"
    },
    {
        path: "supplier-update/:id",
        component: SupplierUpdateComponent,
        title: "Modificar proveedor"
      }
    ,
    {
        path:"employee-post",
        component:IEPFormPostEmployeesComponent,
        title:"Crear empleado"
    },
    {
        path: 'cargos',
        component: IepCargosComponent,
        title: 'Gestión de Cargos'
    },
    {
        
      path: 'empleados/modificar/:id',  // TOMAS H
      component:EmpPutEmployeesComponent,
      title: 'Modificar empleado'
        

    }
  
    
];