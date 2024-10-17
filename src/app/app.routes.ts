import { Routes } from '@angular/router';
import { EmpListadoEmpleadosComponent } from './components/emp-listado-empleados/emp-listado-empleados.component';
import { DetailTableComponent } from './components/detail-table/detail-table.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { StockAumentoComponent } from './components/stock-aumento/stock-aumento.component';
import { TablaComponent } from './components/tabla/tabla.component';
import { FormLlamadoAtencionComponent } from './components/form-llamado-atencion/form-llamado-atencion.component';
import { PerformancelistComponent } from './components/performancelist/performancelist.component';
export const routes: Routes = [
    {
        path: 'stock-aumento',  // SANTI
        component: StockAumentoComponent,
        title: 'Aumento de stock'
    },/*
    {
        path: 'registro-productos', // TOMAS
        component: ProductComponent,
        title: 'Registro de productos'
    },*/
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
        path: 'wake-up-call',  // Nueva ruta para el componente de "Llamado de Atención"
        component: FormLlamadoAtencionComponent,
        title: 'Desempeño'
    },
    {
        path: 'listado-empleados',     // ENZO
        component: EmpListadoEmpleadosComponent,
        title: 'Listado de empleados'
    },
    {
        path: 'listado-desempeño',     // SANTI
        component: PerformancelistComponent,
        title: 'Listado desempeño'
    }
];
