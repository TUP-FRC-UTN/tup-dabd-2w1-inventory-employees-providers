import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

import { DatePipe } from '@angular/common';
import { EmpListadoEmpleadosComponent } from './components/emp-listado-empleados/emp-listado-empleados.component';
import { BotonVolverComponent } from './components/boton-volver/boton-volver.component';
import { DetailTableComponent } from './components/detail-table/detail-table.component';
import { FiltroComponent } from './components/filtro/filtro.component';
import { ModalSelectComponent } from './components/modal-select/modal-select.component';
import { StockAumentoComponent } from './components/stock-aumento/stock-aumento.component';
import { TablaComponent } from './components/tabla/tabla.component';
import { FormLlamadoAtencionComponent } from './components/form-llamado-atencion/form-llamado-atencion.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, EmpListadoEmpleadosComponent, BotonVolverComponent, DetailTableComponent, FiltroComponent,
    ModalSelectComponent, StockAumentoComponent, TablaComponent, FormLlamadoAtencionComponent
  ],
  providers: [],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'accesses';
}
