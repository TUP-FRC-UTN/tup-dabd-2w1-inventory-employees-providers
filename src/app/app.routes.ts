import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { EmpListadoEmpleadosComponent } from './components/emp-listado-empleados/emp-listado-empleados.component';
export const routes: Routes = [
    /*
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
    */
    {
        path: 'listado-empleados',     // ENZO
        component: EmpListadoEmpleadosComponent,
        title: 'Listado de empleados'
    },
];
