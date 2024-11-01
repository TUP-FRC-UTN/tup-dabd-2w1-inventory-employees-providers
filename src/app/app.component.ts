import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

import { DatePipe } from '@angular/common';
import { IepListEmployeesComponent } from './components/iep-list-employees/iep-list-employees.component';
import { iepBackButtonComponent } from './components/iep-back-button/iep-back-button.component';
import { IepDetailTableComponent } from './components/iep-detail-table/iep-detail-table.component';
import { IepFilterComponent } from './components/iep-filter/iep-filter.component';
import { IepModalSelectComponent } from './components/iep-modal-select/iep-modal-select.component';
import { IepStockIncreaseComponent } from './components/iep-stock-increase/iep-stock-increase.component';
import { IepTableComponent } from './components/iep-table/iep-table.component';
import { IepRegisterWarehouseComponent } from './components/iep-register-warehouse/iep-register-warehouse.component';
import { IepPerformancelistComponent } from './components/iep-performancelist/iep-performancelist.component';
import { UsersNavbarComponent } from './components/users-navbar/users-navbar.component';
import { UsersSideButtonComponent } from './components/users-side-button/users-side-button.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, IepListEmployeesComponent, iepBackButtonComponent, IepDetailTableComponent, IepFilterComponent,
    IepModalSelectComponent, UsersNavbarComponent,UsersSideButtonComponent,
    IepStockIncreaseComponent, IepTableComponent, IepRegisterWarehouseComponent, IepPerformancelistComponent],
  providers: [],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'accesses';
}
