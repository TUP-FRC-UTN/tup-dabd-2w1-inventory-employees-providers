import { Routes } from '@angular/router';
import { StockAumentoComponent } from './components/stock-aumento/stock-aumento.component';
import { ProductComponent } from './components/product/product.component';
import { AppComponent } from './app.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { DetailTableComponent } from './components/detail-table/detail-table.component';
import { TablaComponent } from './components/tabla/tabla.component';
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
    }
];
