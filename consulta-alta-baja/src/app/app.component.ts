import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FiltroComponent } from "./components/filtro/filtro.component";
import { TablaComponent } from "./components/tabla/tabla.component";
import { BotonVolverComponent } from "./components/boton-volver/boton-volver.component";
import { NgxPaginationModule } from 'ngx-pagination';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FiltroComponent, TablaComponent, BotonVolverComponent, NgxPaginationModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'consulta-alta-baja';
}
