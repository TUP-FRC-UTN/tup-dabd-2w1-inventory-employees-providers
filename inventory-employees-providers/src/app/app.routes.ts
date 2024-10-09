import { Routes } from '@angular/router';
import { StockAumentoComponent } from './components/stock-aumento/stock-aumento.component';
import { ProductComponent } from './components/product/product.component';
import { AppComponent } from './app.component';
export const routes: Routes = [
    {
        path: 'stock-aumento',
        component: StockAumentoComponent,
        title: 'Aumento de stock'
    },
    {
        path: 'registro-productos',
        component: ProductComponent,
        title: 'Registro de productos'
    }
];
