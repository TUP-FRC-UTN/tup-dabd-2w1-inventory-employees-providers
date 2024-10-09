import { Component, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductComponent } from './components/product/product.component';
import { HttpClient } from '@angular/common/http';
import { StockAumentoComponent } from "./components/stock-aumento/stock-aumento.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProductComponent, StockAumentoComponent],
  providers: [HttpClient],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  

})
export class AppComponent {
  title = 'inventory-employees-providers';
}
