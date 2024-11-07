import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { WakeUpCallDetail } from '../../Models/listado-desempeño';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';

@Component({
  selector: 'app-iep-detail-observation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iep-detail-observation.component.html',
  styleUrl: './iep-detail-observation.component.css'
})
export class IepDetailObservationComponent implements OnInit{
  employeeId: number = 0;
  year: number = 0;
  month: number = 0;
  details: WakeUpCallDetail[] = [];
  dataTable: any;
  searchTerm: string = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: ListadoDesempeñoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.employeeId = +params['id'];
      this.year = +params['year'];
      this.month = +params['month'];
      this.initializeDataTable();
      // Forzar la actualización de los detalles antes de cargar la vista
      /* this.employeeService.refreshWakeUpCallDetails().subscribe(() => {
    
      }); */
    });
  }
  

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    this.subscription.unsubscribe();
  }

  private updateDataTable(): void {
    if (this.dataTable) {
      this.dataTable.clear();
      this.dataTable.rows.add(this.details);
      this.dataTable.draw();
    } else {
      this.initializeDataTable();
    }
  }

  initializeDataTable(): void {
    const table = $('.details-table');
    if (table.length > 0) {
      this.dataTable = table.DataTable({
        data: this.details,
        columns: [
          { 
            data: 'dateReal',
            render: (data: number[]) => `${data[2]}/${data[1]}/${data[0]}`
          },
          { 
            data: 'wackeUpTypeEnum',
            render: (data: string) => `<span class="tag ${data.toLowerCase()}">${data}</span>`
          },
          { data: 'observation' }
        ],
        dom: '<"mb-3"t><"d-flex justify-content-between"lp>',
        pageLength: 10,
        lengthMenu: [5, 10, 20, 25],
        order: [[0, 'asc']],
        language: {
          zeroRecords: "No se encontraron observaciones",
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate([`home/employee/performance/${this.employeeId}`]);
  }
}
