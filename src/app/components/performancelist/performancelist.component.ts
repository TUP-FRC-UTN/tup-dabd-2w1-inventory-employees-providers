import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { EmployeePerformance } from '../../models/listado-desempeño';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import $ from 'jquery'; // Importación de jQuery
import 'datatables.net'; // Importación de DataTables
import 'datatables.net-dt'; // Estilos para DataTables
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-performancelist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performancelist.component.html',
  styleUrl: './performancelist.component.css'
})
export class PerformancelistComponent implements OnInit, AfterViewInit {
  employeePerformances: EmployeePerformance[] = [];
  
  startDate!: string;  
  endDate!: string;    
  showWakeUpCallForm: boolean = false;

  constructor(private employeePerformanceService: ListadoDesempeñoService,private router: Router) {}

  navigateToWakeUpCallForm(): void {
    this.router.navigate(['/wake-up-call']);  // Redirigir a la ruta del formulario
  }

  ngOnInit(): void {
    const today = new Date();

    // Calcular la fecha de inicio y fin del mes anterior
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Asignar las fechas de inicio y fin
    this.startDate = this.formatDate(firstDayOfLastMonth);
    this.endDate = this.formatDate(lastDayOfLastMonth);

    // Obtener las performances del rango de fechas del mes anterior
    this.getPerformancesByDateRange(firstDayOfLastMonth, lastDayOfLastMonth);
  }

  ngAfterViewInit(): void {
    this.initDataTable(); // Inicializar DataTable
  }

  getPerformancesByDateRange(start: Date, end: Date): void {
    this.employeePerformanceService.getEmployeesPerformanceByDateRange(start, end)
      .subscribe((data: EmployeePerformance[]) => {
        this.employeePerformances = data;

        // Volver a inicializar DataTables después de cargar nuevos datos
        this.initDataTable(); // Llamar a la función de inicialización
      });
  }

  onFilterByDate(): void {
    const start = new Date(this.startDate);
    let end = new Date(this.endDate);

    // Validar que las fechas son válidas
    if (start && end && start <= end) {
      // Asegurarse de que la fecha de inicio es el primer día del mes
      start.setDate(1);
      // Asegurarse de que la fecha de fin es el último día del mes
      end = new Date(end.getFullYear(), end.getMonth() + 1, 0); // El último día del mes

      this.getPerformancesByDateRange(start, end);
    } else {
      alert('Por favor, seleccione un rango de fechas válido.');
    }
  }

  initDataTable(): void {
    // Limpiar DataTable si ya está inicializado
    if ($.fn.dataTable.isDataTable('#employeePerformanceTable')) {
      $('#employeePerformanceTable').DataTable().clear().destroy();
    }

    // Inicializar DataTables
    $('#employeePerformanceTable').DataTable({
      data: this.employeePerformances,
      columns: [
        { 
          data: 'performance', // Array de wake up calls
          render: (data) => {
            // Mostrar la fecha de inicio del primer wake up call o 'No hay fechas'
            return data.length > 0 ? new Date(data[0].startDate).toLocaleDateString() : 'No hay fechas';
          }
        },
        { 
          data: 'performance', // Array de wake up calls
          render: (data) => {
            // Mostrar la fecha de fin del primer wake up call o 'No hay fechas'
            return data.length > 0 ? new Date(data[0].endDate).toLocaleDateString() : 'No hay fechas';
          }
        },
        { data: 'employee.fullName' }, // Nombre del empleado
        { data: 'employee.position' },  // Cargo del empleado
        { 
          data: 'performance', // Array de wake up calls
          render: (data) => {
            // Mostrar el primer tipo de desempeño o 'No hay datos'
            return data.length > 0 ? data[0].performanceType : 'No hay datos';
          }
        },
        { 
          data: 'performance', // Array de wake up calls
          render: (data) => {
            // Mostrar la cantidad de observaciones o 'No hay observaciones'
            return data.length > 0 ? data.length : 'No hay observaciones';
          }
        }
      ]
    });
  }

  // Método para formatear la fecha en formato 'YYYY-MM-DD'
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Sumar 1 al mes
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}