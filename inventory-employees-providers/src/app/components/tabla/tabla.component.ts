import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../interfaces/producto';
import { FiltroComponent } from '../filtro/filtro.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, FiltroComponent],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css'],
})
export class TablaComponent implements OnInit {
  productos: Producto[] = []; // Lista completa de productos
  productosFiltrados: Producto[] = []; // Lista filtrada de productos
  productosNombres: string[] = []; // Nombres de productos para el input
  columnaOrden: keyof Producto | null = null;
  ordenAscendente = true;
  mostrarFiltro: boolean = false; // Variable para controlar la visibilidad del filtro
  paginaActual: number = 1; // Página actual
  itemsPorPagina: number = 10; // Número de elementos por página

  constructor(private productoService: ProductService) {}

  ngOnInit() {
    this.cargarProductos(); // Carga inicial de productos
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe(
      (data) => {
        this.productos = data; // Almacena los productos
        this.productosNombres = this.productos.map((p) => p.product); // Crea la lista para el input
        this.productosFiltrados = [...this.productos]; // Inicialmente, la lista filtrada es igual a la completa
      },
      (error) => {
        console.error('Error al cargar productos', error);
      }
    );
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro; // Alterna la visibilidad del filtro
  }

  aplicarFiltro(filtro: { desde: string; hasta: string; busqueda: string }) {
    const { desde, hasta, busqueda } = filtro;
    const fechaDesde = desde ? new Date(desde) : null;
    const fechaHasta = hasta ? new Date(hasta) : null;

    this.productosFiltrados = this.productos.filter((productoItem) => {
      const fechaProducto = new Date(productoItem.date);
      const fechaValida =
        (!fechaDesde || fechaProducto >= fechaDesde) &&
        (!fechaHasta || fechaProducto <= fechaHasta);

      const busquedaMinuscula = busqueda.toLowerCase();
      const busquedaValida = busqueda
        ? productoItem.product.toLowerCase().includes(busquedaMinuscula) ||
          productoItem.modificationType.toLowerCase().includes(busquedaMinuscula) ||
          productoItem.supplier.toLowerCase().includes(busquedaMinuscula) ||
          productoItem.amount.toString().includes(busquedaMinuscula) ||
          productoItem.description.toLowerCase().includes(busquedaMinuscula)
        : true;

      return fechaValida && busquedaValida;
    });
    this.paginaActual = 1;
  }

  ordenarPor(columna: keyof Producto) {
    if (this.columnaOrden === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }

    this.productosFiltrados.sort((a, b) => {
      let valorA = a[columna];
      let valorB = b[columna];

      if (valorA < valorB) {
        return this.ordenAscendente ? -1 : 1;
      } else if (valorA > valorB) {
        return this.ordenAscendente ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  resetearFiltros() {
    this.productosFiltrados = [...this.productos];
    this.mostrarFiltro = false; // Oculta el filtro al resetear
    this.paginaActual = 1; // Reiniciar a la primera página
  }

  // Método para obtener los productos de la página actual
  paginacionProductos() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  // Método para calcular el total de páginas
  totalPaginas() {
    return Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
  }

  // Método para cambiar de página
  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual = nuevaPagina;
    }
  }

  // Genera el PDF
  generatePDF(): void {
    this.productoService.getPdf().subscribe((pdfArrayBuffer) => {
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'detalle_productos.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Genera el Excel
  generateExcel(): void {
    //window.open(this.productoService.apiUrlExcel, '_blank');
    const enlace = document.createElement('a');
    enlace.href = this.productoService.apiUrlExcel; // URL del archivo
    enlace.download = ''; // Esto sugiere al navegador que debe descargar el archivo
    document.body.appendChild(enlace); // Necesario para algunos navegadores
    enlace.click(); // Simula el clic en el enlace
    document.body.removeChild(enlace); // Limpieza
  }
}
