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
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Desempeños de Empleados', 10, 10);

    const dataToExport = this.performances.map((performance) => [
      performance.id,
      performance.fullName,
      performance.year,
      this.months[performance.month - 1], // Convert month number to name
      performance.totalObservations,
      performance.performanceType,
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Nombre Completo', 'Año', 'Mes', 'Total Observaciones', 'Tipo de Desempeño']],
      body: dataToExport,
      startY: 20,
    });

    doc.save('Lista_Desempeños.pdf');
}

exportToExcel(): void {
  const dataToExport = this.performances.map((performance) => ({
    'ID': performance.id,
    'Nombre Completo': performance.fullName,
    'Año': performance.year,
    'Mes': this.months[performance.month - 1], // Convert month number to name
    'Total Observaciones': performance.totalObservations,
    'Tipo de Desempeño': performance.performanceType,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Desempeños');

  XLSX.writeFile(workbook, 'Lista_Desempeños.xlsx');
}


  ngOnInit(): void {
    // Suscribirse a los datos para recibir actualizaciones en tiempo real
    this.employeeService.performances$.subscribe({
      next: (data) => {
        this.performances = data;
        this.setAvailableYears();
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
      }
    });

    // Inicializar los datos
    this.employeeService.refreshData();
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