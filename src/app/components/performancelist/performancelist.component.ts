import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { EmployeePerformance } from '../../models/listado-desempeño';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
  searchTerm: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';
  dataTable: any;

  availableYears: number[] = [];
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  showModal = false;
  
  showInfoModal = false; // Nueva variable para el modal de información

  constructor(
    private employeeService: ListadoDesempeñoService,
    private router: Router
  ) {}

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
    // Primero obtenemos los datos
    this.loadData();
    this.employeeService.refreshData();
  }

  ngOnDestroy() {
    // Destruir la tabla cuando el componente se destruye
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  loadData(): void {
    this.employeeService.getCombinedData().subscribe({
      next: (data) => {
        this.performances = data;
        this.setAvailableYears();
        // Inicializamos la tabla después de que los datos estén disponibles
        setTimeout(() => {
          this.initializeDataTable();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading data:', error);
      }
    });
  }

  initializeDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    const table = $('.data-table');
    if (table.length > 0) {
      this.dataTable = table.DataTable({
        data: this.performances,
        columns: [
          { data: 'year' },
          { 
            data: 'month',
            render: (data: number) => this.getMonthName(data)
          },
          { data: 'fullName' },
          { data: 'totalObservations' },
          { 
            data: 'performanceType',
            render: (data: string) => {
              return `<span class="tag ${data.toLowerCase()}">${data}</span>`;
            }
          }
        ],
        language: {
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
          },
          lengthMenu: "Mostrando _MENU_ registros por página",
          zeroRecords: "No se encontraron registros",
          info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
          infoEmpty: "Mostrando 0 a 0 de 0 registros",
          infoFiltered: "(filtrado de _MAX_ registros totales)",
          search: "Buscar:"
        },
        pageLength: 10,
        order: [[0, 'desc'], [1, 'desc']]
      });
    }
  }

  setAvailableYears(): void {
    const years = this.performances.map(p => p.year);
    this.availableYears = [...new Set(years)].sort((a, b) => b - a);
  }

  filterData(): void {
    if (!this.dataTable) return;

    this.dataTable.search(this.searchTerm);

    // Aplicar filtros de año y mes
    $.fn.dataTable.ext.search.push(
      (settings: any, data: any[]) => {
        if (this.selectedYear === '' && this.selectedMonth === '') return true;
        
        const rowYear = data[0];
        const rowMonth = data[1];
        
        const yearMatch = this.selectedYear === '' || rowYear === this.selectedYear;
        const monthMatch = this.selectedMonth === '' || 
          rowMonth === this.getMonthName(parseInt(this.selectedMonth));
        
        return yearMatch && monthMatch;
      }
    );

    this.dataTable.draw();
  }

  getMonthName(month: number): string {
    return this.months[month - 1];
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.loadData();
  }

  navigateToWakeUpCallForm(): void {
    this.router.navigate(['/wake-up-call']);
  }

  openInfoModal() { // Nueva función para abrir el modal de información
    this.showInfoModal = true;
  }

  closeInfoModal() { // Nueva función para cerrar el modal de información
    this.showInfoModal = false;
  }
}