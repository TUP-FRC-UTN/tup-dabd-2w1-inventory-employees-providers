// tabla.component.ts
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
})
export class TablaComponent implements OnInit {
  productos: Producto[] = []; // Lista completa de productos
  productosFiltrados: Producto[] = []; // Lista filtrada de productos
  productosNombres: string[] = []; // Nombres de productos para el input
  columnaOrden: keyof Producto | null = null;
  ordenAscendente = true;

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
  }

  resetearFiltros() {
    // Restablecer productos filtrados a la lista original
    this.productosFiltrados = [...this.productos];
    // Si necesitas limpiar los campos de entrada del filtro, puedes hacerlo aquí
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
}
