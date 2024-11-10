import { Component, inject, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { ProductService } from '../../services/product.service';
import { StockAumentoService } from '../../services/stock-aumento.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-iep-charts-inventory',
  standalone: true,
  imports: [GoogleChartsModule, CommonModule, FormsModule],
  templateUrl: './iep-charts-inventory.component.html',
  styleUrl: './iep-charts-inventory.component.css'
})
export class IepChartsInventoryComponent implements OnInit {
  private productoService = inject(ProductService);
  private stockHistorial = inject(StockAumentoService);
  
  fechaInicio!: string;
  fechaFin!: string;

  productos: any[] = []
  modificaciones: any[] = [];
  modificacionesFiltradas: any[] = [];

  chartTypeColumnas: ChartType = ChartType.ColumnChart;
  chartTypeCirculo: ChartType = ChartType.PieChart;
  
  dataHistorial: any[] = [];
  dataProductos: any[] = [];
  dataEstadosProductos: any[] = [];

  chartOptionsProductos = {
    title: 'Productos',
    colors: ['#28a745'],
  };

  chartOptionsEstadosProductos = {
    title: 'Estado productos',
    colors: ['#28a745', '#dc3545', '#ffc107']
  };

  chartOptionsHistorial = {
    colors: ['#008000', '#FF0000'],
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
  };

  ngOnInit(): void {
    this.initializeDates();
    this.setInitialDates();
    this.loadProductos();
    this.loadHistorial();
  }

  loadProductos(){
    const empSubscription = this.productoService.getAllProducts().subscribe({
      next: (Productos) =>{
         this.productos = [];
         this.productos = Productos;
         this.cargarProductos();
        }
      })
  }

  loadHistorial(){
    const empSubscription = this.stockHistorial.getModifications().subscribe({
      next: (Modificacion) =>{
        this.modificaciones = [];
        this.modificaciones = Modificacion;
        this.modificacionesFiltradas = Modificacion;
        this.filtrar();
        this.cargarModificaciones();
      },
      error: (err) => console.error('Error al cargar asistencias:', err)
    })
  }

  cargarProductos(){
    this.dataProductos = [];
    const categorias: Set<String> = new Set();
    this.productos.forEach(producto => {
      categorias.add(producto.category.categoryName)
    });
    
    categorias.forEach(categoria => {
      var total = 0;
      
      this.productos.forEach(producto => {
        if (categoria === producto.category.categoryName){
          total = total + producto.detailProducts.length;
        }
      });

      this.dataProductos.push([categoria, total])
    });

    this.cargarEstados();
  }

  cargarEstados(){
    var d = 0;
    var p = 0;
    var m = 0;

    this.productos.forEach(producto => {
      const detalles: any[] = producto.detailProducts; 
      detalles.forEach(detalle => {
        switch(detalle.state){
          case "Disponible": d++; break;
          case "Prestado": p++; break;
          case "Mantenimiento": m++; break;
        }
      });
    });

    const total = d + p + m;

    this.dataEstadosProductos = [];

    this.dataEstadosProductos.push(["Disponible", d / total * 100],["Prestado", p /total * 100],
    ["Mantenimiento", m /total * 100])
  }

  cargarModificaciones(){
    
    const fechas: Set<Date> = new Set();
    this.modificacionesFiltradas.forEach(modificacion => {
      const parts = modificacion.date.split('/');
      const fechaModificacion = new Date(+parts[2], +parts[1] - 1, +parts[0]);

      fechas.add(fechaModificacion);
    });

    this.dataHistorial = [];
    fechas.forEach(fecha => {
      var totalAumento = 0;
      var totalDisminucion = 0;
      this.modificaciones.forEach(modificacion => {
        const parts = modificacion.date.split('/');
        const fechaModificacion = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  
        if (fecha.getDate() === fechaModificacion.getDate() && 
            fecha.getMonth() === fechaModificacion.getMonth()) {
            switch (modificacion.modificationType){
              case 'Aumento': totalAumento = totalAumento + modificacion.amount; break;
              case 'Disminución': totalDisminucion = totalDisminucion + modificacion.amount; break;
          }
        }
      });
      
      this.dataHistorial.push([fecha,totalAumento,totalDisminucion]);
    });

    //modificacionesFiltradas.forEach(modificacion => {
      //console.log(modificacion.date)
      //this.dataHistorial.push(new Date(modificacion.date), modificacion.amount)
    //});

    //const categoria: Set<string> = new Set();
    //this.modificaciones.forEach(modificacion => {
   //   console.log(modificacion);
      //categoria.add(modificacion.product)
   // });
    //this.columnNames.push("Categoria")
    //categoria.forEach(categoria => {
    //  this.columnNames.push(categoria);
    // });
  }

  initializeDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.fechaInicio = this.formatInitialDate(thirtyDaysAgo);
    this.fechaFin = this.formatInitialDate(today);
  }

  private formatInitialDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
  
  setInitialDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

    startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];

    console.log(startDateInput.value);
    console.log(endDateInput.value);

    // Establecer los límites de las fechas
    endDateInput.max = today.toISOString().split('T')[0];
    startDateInput.max = endDateInput.value;
    endDateInput.min = startDateInput.value;
  }

  onStartDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

    // Establecer límites de fechas
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    endDateInput.max = formattedToday;

    if (startDateInput.value) { endDateInput.min = startDateInput.value; } 
    else { endDateInput.min = ''; }

    this.loadHistorial();
  }

  onEndDateChange(): void {
    const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

    // Establecer límites de fechas
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    endDateInput.max = formattedToday;

    if (endDateInput.value) { startDateInput.max = endDateInput.value; } 
    else { startDateInput.max = ''; }

    this.loadHistorial();
  }

  filtrar(){
    const startDateInput: HTMLInputElement = document.getElementById('fechaInicio') as HTMLInputElement;
    const endDateInput: HTMLInputElement = document.getElementById('fechaFin') as HTMLInputElement;

    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
    
    if (startDate && endDate && startDate > endDate) {
      //alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
  
      startDateInput.value = '';
      endDateInput.value = '';
      return;
    }

    this.modificacionesFiltradas = this.modificaciones.filter((modificacion) => {
      const productDate = new Date(this.formatDateyyyyMMdd(modificacion.date));
      console.log(productDate);
      return (
        (!startDate || productDate >= startDate) &&
        (!endDate || productDate <= endDate)
      );
    });
  }

  formatDateyyyyMMdd(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  limpiarFiltro(){
    this.modificacionesFiltradas = [];
    this.setInitialDates();
    this.loadHistorial();
  }
}
