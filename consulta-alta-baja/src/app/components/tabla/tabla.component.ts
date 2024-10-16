import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../interfaces/producto';
import { FiltroComponent } from '../filtro/filtro.component';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, FiltroComponent],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
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

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos(); // Carga inicial de productos
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe(
      (data) => {
        this.productos = data; // Almacena los productos
        this.productosNombres = this.productos.map(p => p.product); // Crea la lista para el input
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

  aplicarFiltro(filtro: { desde: string; hasta: string; producto: string }) {
    const { desde, hasta, producto } = filtro;
    const fechaDesde = desde ? new Date(desde) : null;
    const fechaHasta = hasta ? new Date(hasta) : null;

    this.productosFiltrados = this.productos.filter(productoItem => {
      const fechaProducto = new Date(productoItem.date); // Asegúrate de que fecha sea un objeto Date
      const fechaValida = (!fechaDesde || fechaProducto >= fechaDesde) &&
                          (!fechaHasta || fechaProducto <= fechaHasta);
      const productoValido = producto ? productoItem.product.toLowerCase().includes(producto.toLowerCase()) : true; // Filtrar según el input

      return fechaValida && productoValido;
    });
    this.paginaActual = 1; // Reiniciar a la primera página al aplicar un filtro
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

  traducirMovimiento(tipoMovimiento: string): string {
    switch (tipoMovimiento) {
      case 'INCREASE':
        return 'Aumento';
      case 'DECREMENT':
        return 'Disminución';
      default:
        return tipoMovimiento; // Por si acaso hay otros valores inesperados
    }
  }
}
