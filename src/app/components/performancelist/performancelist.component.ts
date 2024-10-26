import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { EmployeePerformance } from '../../models/listado-desempeño';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';

import $ from 'jquery';
import 'datatables.net'; // Importación de DataTables
import 'datatables.net-dt'; // Estilos para DataTables
import { BrowserModule } from '@angular/platform-browser';
import { StockAumentoComponent } from '../stock-aumento/stock-aumento.component';
import { FormLlamadoAtencionComponent } from '../form-llamado-atencion/form-llamado-atencion.component';

@Component({
  selector: 'app-performancelist',
  standalone: true,
  imports: [CommonModule, FormsModule, StockAumentoComponent, FormLlamadoAtencionComponent],
  templateUrl: './performancelist.component.html',
  styleUrl: './performancelist.component.css'
})
export class PerformancelistComponent implements OnInit {
  performances: EmployeePerformance[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';

  availableYears: number[] = []; // Lista de años disponibles para el filtro
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  constructor(private employeeService: ListadoDesempeñoService, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.employeeService.getCombinedData().subscribe({
      next: (data) => {
        this.performances = data;
        this.setAvailableYears(); // Inicializar años disponibles
      },
      error: (error) => {
        console.error('Error loading data:', error);
      }
    });
  }

  



  setAvailableYears(): void {
    const years = this.performances.map(p => p.year);
    this.availableYears = [...new Set(years)].sort((a, b) => b - a);
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.performances.sort((a: any, b: any) => {
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      return a[column] > b[column] ? direction : -direction;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  filterData(): EmployeePerformance[] {
    return this.performances.filter(performance =>
      (this.searchTerm === '' || performance.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) || performance.performanceType.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.selectedYear === '' || performance.year === +this.selectedYear) &&
      (this.selectedMonth === '' || performance.month === +this.selectedMonth)
    );
  }

  getMonthName(month: number): string {
    return this.months[month - 1];
  }

  navigateToWakeUpCallForm(): void {
    this.router.navigate(['/wake-up-call']);
  }
}