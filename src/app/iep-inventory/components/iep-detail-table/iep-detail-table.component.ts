import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import { Details, PostDecrement } from '../../models/details';
declare var bootstrap: any;
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { EmpListadoEmpleados } from '../../../iep-employees/Models/emp-listado-empleados';
import { EmpListadoEmpleadosService } from '../../../iep-employees/services/emp-listado-empleados.service';
import { WarehouseMovementService } from '../../services/warehouse-movement.service';
import { catchError, delay, min, Observable } from 'rxjs';
import { IepCreateWarehouseMovementDTO } from '../../models/iep-create-warehouse-movement-dto';
import { DetailServiceService } from '../../services/detail-service.service';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-iep-detail-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './iep-detail-table.component.html',
  styleUrls: ['./iep-detail-table.component.css'],
})
export class IepDetailTableComponent {

  
}
