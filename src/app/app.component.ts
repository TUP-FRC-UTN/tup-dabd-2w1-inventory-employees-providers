import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductEliminationComponent } from "./product-elimination/product-elimination.component";
import { ProductTableComponent } from "./product-table/product-table.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProductEliminationComponent, ProductTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'disminucion-stock';
}