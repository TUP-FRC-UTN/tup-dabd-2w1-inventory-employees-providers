import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
@Component({
  selector: 'app-filtro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './filtro.component.html'
})
export class FiltroComponent {
  @Output() filtroAplicado = new EventEmitter<{ desde: string, hasta: string, producto: string }>();
  @Output() filtrosEliminados = new EventEmitter<void>(); // Evento para eliminar filtros
  @Input() productos: string[] = []; // Recibir lista de productos como Input

  desde: string = '';
  hasta: string = '';
  producto: string = '';
  error: string = '';

  constructor(private productService: ProductService) {
    this.setUltimoMes(); // Establecer fechas iniciales al último mes
  }

  // Método para establecer las fechas predeterminadas (último mes)
  setUltimoMes() {
    const hoy = new Date();
    const ultimoMes = new Date();
    ultimoMes.setMonth(hoy.getMonth() - 1);

    this.desde = ultimoMes.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
    this.hasta = hoy.toISOString().split('T')[0];
  }

  // Validaciones y aplicación automática del filtro
  onInputChange() {
    const fechaDesde = new Date(this.desde);
    const fechaHasta = new Date(this.hasta);

    if (this.desde && this.hasta && fechaHasta < fechaDesde) {
      this.error = 'La fecha "hasta" no puede ser anterior a la fecha "desde".';
      return;
    }

    this.error = '';
    this.filtroAplicado.emit({
      desde: this.desde,
      hasta: this.hasta,
      producto: this.producto
    });
  }

  // Aplicar filtro manualmente al enviar el formulario
  onSubmit() {
    this.onInputChange();
  }

  // Eliminar filtros
  eliminarFiltros() {
    this.setUltimoMes(); // Restablecer el último mes
    this.producto = '';
    this.error = '';
    this.filtrosEliminados.emit();
  }


}