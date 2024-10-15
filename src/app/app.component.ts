import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { DatePipe } from '@angular/common';
import { EmpListadoEmpleadosComponent } from './components/emp-listado-empleados/emp-listado-empleados.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, EmpListadoEmpleadosComponent
  ],
  providers: [],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'accesses';
}
