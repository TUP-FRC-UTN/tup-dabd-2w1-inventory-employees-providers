import { Component } from '@angular/core';
import { BotonVolverComponent } from "../boton-volver/boton-volver.component";

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [BotonVolverComponent],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.css'
})
export class SupplierListComponent {

}
