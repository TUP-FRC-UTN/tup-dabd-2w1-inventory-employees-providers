import { Component, inject, OnInit } from '@angular/core';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-iep-charts-inventory',
  standalone: true,
  imports: [GoogleChartsModule],
  templateUrl: './iep-charts-inventory.component.html',
  styleUrl: './iep-charts-inventory.component.css'
})
export class IepChartsInventoryComponent implements OnInit {
  private productoService = inject(ProductService);
  
  productos: any[] = []

  chartTypeProductos: ChartType = ChartType.ColumnChart;
  dataProductos: any[] = [];
  columnNamesProductos = ['Producto', 'Cantidad'];
  chartOptionsProductos = {
    title: 'Productos',
    colors: ['#28a745'],
  };

  chartTypeEstadosProductos: ChartType = ChartType.PieChart;
  dataEstadosProductos: any[] = [];
  columnNamesEstadosProductos = ['Estado', 'Porcentaje'];
  chartOptionsEstadosProductos = {
    title: 'Estado productos',
    colors: ['#28a745', '#dc3545', '#ffc107']
  };

  chartType: ChartType = ChartType.LineChart;
  data: any[] = [];
  columnNames: string[] = ['Categoria'];
  chartOptions = {
    title: 'Estado productos',
    colors: ['#0000FF', '#FF0000', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF',
          '#FFA500', '#800080', '#008000', '#FFC0CB', '#FFD700', '#A52A2A',
          '#F08080', '#C0C0C0', '#808080', '#000080', '#800000', '#808000',
          '#FF4500', '#2E8B57', '#8A2BE2', '#5F9EA0', '#D2691E', '#CD5C5C',
          '#4B0082', '#FF6347', '#7FFF00', '#FFDAB9', '#B0E0E6', '#98FB98',
          '#FF69B4', '#F0E68C', '#ADFF2F', '#4682B4', '#D8BFD8', '#DDA0DD',
          '#F5DEB3', '#FFE4E1', '#FFB6C1', '#20B2AA', '#FF8C00', '#B22222',
          '#5F9EA0', '#6A5ACD', '#7CFC00', '#FF1493', '#8B4513', '#B8860B',
          '#A9A9A9', '#00FA9A', '#F0E68C', '#FFD700', '#1E90FF', '#FF7F50',
          '#DC143C', '#00BFFF', '#4682B4', '#32CD32', '#ADFF2F', '#FF4500']
  };

  width = 800;
  height = 800;

  ngOnInit(): void {
    this.loadProductos();
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

  cargarProductos(){
    this.dataProductos = [];
    this.productos.forEach(producto => {

      this.dataProductos.push([producto.name, producto.detailProducts.length])
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

}
