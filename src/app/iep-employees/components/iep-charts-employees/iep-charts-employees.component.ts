import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { EmpListadoEmpleadosService } from '../../services/emp-listado-empleados.service';
import { EmpListadoAsistencias } from '../../Models/emp-listado-asistencias';
import { FormsModule } from '@angular/forms';
import { EmpListadoEmpleados } from '../../Models/emp-listado-empleados';
import { ListadoDesempeñoService } from '../../services/listado-desempeño.service';
import { WakeUpCallDetail } from '../../Models/listado-desempeño';

@Component({
  selector: 'app-iep-charts-employees',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule],
  templateUrl: './iep-charts-employees.component.html',
  styleUrl: './iep-charts-employees.component.css'
})
export class IepChartsEmployeesComponent implements OnInit{
  // Servicios para hacer GET de los datos
  empleadosService = inject(EmpListadoEmpleadosService);
  llamadosService = inject(ListadoDesempeñoService);
  
  // Listas para guardar todos los datos
  asistencias: EmpListadoAsistencias[] = [];
  empleados: EmpListadoEmpleados[] = [];
  llamados: WakeUpCallDetail[]= [];

  // Listas para guardar los datos filtrados
  asistenciasFiltradas: EmpListadoAsistencias[] = [];

  // Variables para guardar los datos de filtros
  empleado: string = "";
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  // Variables para definir los tipos de graficos a protectar
  chartTypeCirculo: ChartType = ChartType.PieChart;
  chartTypeBarras: ChartType = ChartType.BarChart;
  
  // Listas con los datos a proyectar en los graficos
  dataAsistencias: any[] = [];
  dataLlamados: any[] = [];
  dataCargos: any[] = [];

  // Configuraciones para los graficos
  chartOptionsAsistencias = {
    colors: ['#28a745', '#dc3545', '#ffc107', '#6f42c1']
  };
  
  chartOptionsLlamados = {
    colors: ['#28a745', '#ffc107','#dc3545'],
    vAxis:{
      minValue:0
    },
    isStacked: true,
  };

  ngOnInit(): void {
    this.getAsistencias();
    this.loadEmpleados();
    this.getLlamados();
  }

  loadEmpleados(): void {
     const empSubscription = this.empleadosService.getEmployees().subscribe({
     next: (Empleados) =>{
        this.empleados = [];
        this.empleados = Empleados;
        this.cargarTiposEmpleados();
       }
     })
   }

  // Metodo para llavar al servicio y conseguir todas las asistencias
  getAsistencias(): void {
    this.asistencias = [];
    const empSubscription = this.empleadosService.getAttendances().subscribe({
      next: (Asistencias) => {
        this.asistencias = Asistencias;
        this.filtrar();
      }
    })
  }

  // Metodo para llavar al servicio y conseguir todos los llamados de atencion
  getLlamados(): void{
    this.llamados = []
    const empSubscription = this.llamadosService.getWakeUpCallDetails().subscribe({
      next: (Llamados) => {
        this.llamados = [];
        this.llamados = Llamados;
        console.log(this.llamados)
        this.cargarLlamados();
      }
    })
  }
  
  // Metodo para cargar en el grafico los datos de asistencias
  cargarAsistencias(){
    var p = 0;
    var au = 0;
    var t = 0;
    var j = 0;
    const total = this.asistenciasFiltradas.length;

    this.asistenciasFiltradas.forEach(a => {
      switch(a.state){
        case "PRESENTE": p++; break;
        case "AUSENTE": au++; break;
        case "TARDE": t++; break;
        case "JUSTIFICADO": j++; break;
      }
    });

    this.dataAsistencias = [];

    this.dataAsistencias.push(["Presente", p / total * 100],["Ausente", au / total * 100],
    ["Tarde", t / total * 100],["Justificado", j / total * 100]);
  }

  // Metodo para cargar en el grafico los datos de llamados de atencion
  cargarLlamados(){
    const meses: Set<number> = new Set();

    this.llamados.forEach(llamado => {
      meses.add(llamado.dateReal[1])
      console.log("Meses:"+meses);
    });

    const mesesLlamados: number[] = Array.from(meses);
    mesesLlamados.sort((a, b) => a - b);

    this.dataLlamados = [];
    mesesLlamados.forEach(mes => {

      var l = 0;
      var m = 0;
      var s = 0;

      this.llamados.forEach(llamado => {
        if(llamado.dateReal[1] === mes){
          switch (llamado.wackeUpTypeEnum){
            case "Leve": l++; break;
            case "Moderado": m++; break;
            case "Severo": s++; break;
          }
        }
      });

      this.dataLlamados.push([this.convertirNumeroAMes(mes),l,m,s])
    });
  }
  
  cargarTiposEmpleados(){
    const tipos: Set<string> = new Set();

    console.log(this.empleados)
    this.empleados.forEach(empleado => {
      tipos.add(empleado.position);
    });

    const tiposSinDuplicados: string[] = Array.from(tipos);
    this.dataCargos = [];
    tiposSinDuplicados.forEach(tipo => {
      const empleadosConTipo = this.empleados.filter(empleado => empleado.position === tipo);

      this.dataCargos.push([tipo, empleadosConTipo.length / this.empleados.length * 100])
    });
  }
  
  // Llamar a todos los metodos de filtrado y despues 
  // ejecutar los metodos para cargar los datos de los graficos
  filtrar(){
    this.asistenciasFiltradas = this.filtrarAsistencias();

    this.cargarAsistencias();
  }

  // Filtra las asistencias en funcion de los valores de los filtros
  filtrarAsistencias(): EmpListadoAsistencias[] {
    var asistenciasFiltradas: EmpListadoAsistencias[] = this.asistencias;

    // Filtrar por empleado si esta definido
    if (this.empleado){
      asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
        return asistencia.employeeName === this.empleado;
      })
    }
    
    // Filtrar por fecha si al menos una de las dos esta definida
    if (this.fechaInicio || this.fechaFin) {
      const inicioDate = this.fechaInicio ? new Date(this.fechaInicio) : null;
      const finDate = this.fechaFin ? new Date(this.fechaFin) : null;

      asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {

        const asistenciaDateParts = asistencia.date.split('/'); // Si es DD/MM/YYYY
        const asistenciaDate = new Date(
          Number(asistenciaDateParts[2]), // Año
          Number(asistenciaDateParts[1]) - 1, // Mes (0-indexado)
          Number(asistenciaDateParts[0]) // Día
        );

        if(inicioDate && finDate) {return inicioDate <= asistenciaDate && asistenciaDate <= finDate}
        else if (finDate) { return asistenciaDate <= finDate }
        else if (inicioDate) { return asistenciaDate >= inicioDate; }

        return true;
      })
    }

    return asistenciasFiltradas;
  }

  // Filtra los llamados en funcion de los valores de los filtros
  filtrarLlamados(){

  }

  limpiarFiltro(){
    this.empleado = "";
    this.fechaInicio = null;
    this.fechaFin = null;
    this.getAsistencias();
    this.getLlamados();
  }

  convertirNumeroAMes(numero: number): string {
    const meses: string[] = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    if (numero < 1 || numero > 12) {
      throw new Error("Número de mes no válido. Debe ser un valor entre 1 y 12.");
    }

    return meses[numero - 1];
  }
}
