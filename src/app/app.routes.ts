import { Routes } from '@angular/router';
import { IepDetailTableComponent } from './iep-inventory/components/iep-detail-table/iep-detail-table.component';
import { IepInventoryComponent } from './iep-inventory/components/iep-inventory/iep-inventory.component';
import { IepStockIncreaseComponent } from './iep-inventory/components/iep-stock-increase/iep-stock-increase.component';
import { IepTableComponent } from './iep-inventory/components/iep-table/iep-table.component';
import { IepProductComponent } from './iep-inventory/components/iep-product/iep-product.component';
import { IepAttentionCallComponent } from './iep-employees/components/iep-attention-call/iep-attention-call.component';
import { IepWarehouseMovementSearchComponent } from './iep-inventory/components/iep-warehouse-movement-search/iep-warehouse-movement-search.component';
import { UsersNavbarComponent } from './common-components/users-navbar/users-navbar.component';
import { IepChargesComponent } from './iep-employees/components/iep-charges/iep-charges.component';
import { IEPFormPostEmployeesComponent } from './iep-employees/components/iep-form-post-employees/iep-form-post-employees.component';
import { IepListEmployeesComponent } from './iep-employees/components/iep-list-employees/iep-list-employees.component';
import { IepPerformancelistComponent } from './iep-employees/components/iep-performancelist/iep-performancelist.component';
import { IepPutEmployeesComponent } from './iep-employees/components/iep-put-employees/iep-put-employees.component';
import { IepSupplierListComponent } from './iep-inventory/components/iep-supplier-list/iep-supplier-list.component';
import { IepSupplierUpdateComponent } from './iep-inventory/components/iep-supplier-update/iep-supplier-update.component';
import { IepSuppliersFormComponent } from './iep-inventory/components/iep-suppliers-form/iep-suppliers-form.component';
import { IepChartsEmployeesComponent } from './iep-employees/components/iep-charts-employees/iep-charts-employees.component';
export const routes: Routes = [
    {
        path: "", redirectTo: "/home", pathMatch: "full" 
    },
    {
        path: "home", component: UsersNavbarComponent,
        data:{roles: ["Admin", "Owner","Encargado de empleados",
            ,"Encargado de inventario"]},
        children: [
                {
                    path: 'stock-aumento',  // SANTI
                    component: IepStockIncreaseComponent,
                    title: 'Aumento de stock'
                },
                {
                    path: 'new-product', // TOMAS
                    component: IepProductComponent,
                    title: 'Registro de productos'
                },
                {
                    path: 'inventory',     // AGUSTIN
                    component: IepInventoryComponent,
                    title: 'Inventario'
                },
                {
                    path: 'inventory-detail',     // MARTIN
                    component: IepDetailTableComponent,
                    title: 'Detalle de inventario'
                },
                {
                    path: 'modification-stock-list',     // ENZO
                    component: IepTableComponent,
                    title: 'Historial de modificacion de stock'
                },
                {
                    path: 'employee-list',     // ENZO
                    component: IepListEmployeesComponent,
                    title: 'Listado de empleados'
                },
                {
                    path: 'wake-up-call',
                    component: IepAttentionCallComponent,
                    title: 'Llamada de atención'
                },
                {
                    path: 'warehouse-movements',
                    component: IepWarehouseMovementSearchComponent,
                    title: 'Ver almacenes'
                },
                {
                    path: 'performance',
                    component: IepPerformancelistComponent,
                    title: 'desempeño'
                },
            
                {
                    path: "suppliers",
                    component: IepSupplierListComponent,
                    title: "proveedores"
                },
                {
                    path: "create-supplier",
                    component: IepSuppliersFormComponent,
                    title: "Crear proveedor"
                },
                {
                    path: "supplier-update/:id",
                    component: IepSupplierUpdateComponent,
                    title: "Modificar proveedor"
                  }
                ,
                {
                    path:"employee-post",
                    component:IEPFormPostEmployeesComponent,
                    title:"Crear empleado"
                },
                {
                    path: 'charges',
                    component: IepChargesComponent,
                    title: 'Gestión de Cargos'
                },
                {
                    
                  path: 'employee/update/:id',  // TOMAS H
                  component:IepPutEmployeesComponent,
                  title: 'Modificar empleado'
                },
                {
                  path: 'employee/charts',
                  component:IepChartsEmployeesComponent,
                  title: 'Grafico empleados'  
                }
            ]
    }
];