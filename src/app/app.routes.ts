import { Routes } from '@angular/router';
import { EmpListadoEmpleadosComponent } from './components/emp-listado-empleados/emp-listado-empleados.component';
import { DetailTableComponent } from './components/detail-table/detail-table.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { StockAumentoComponent } from './components/stock-aumento/stock-aumento.component';
import { TablaComponent } from './components/tabla/tabla.component';
import { ProductComponent } from './components/product/product.component';
import { SuppliersFormComponent } from './components/suppliers-form/suppliers-form.component';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
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
        path:"suppliers",
        component:SupplierListComponent,
        title:"proveedores"
    },
    {
        path:"create-supplier",
        component:SuppliersFormComponent,
        title:"Crear proveedor"
    },
];
