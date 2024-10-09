// filtro.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  onSubmit() {
    const fechaDesde = new Date(this.desde);
    const fechaHasta = new Date(this.hasta);
  
    // Validar que la fecha hasta no sea anterior a la fecha desde
    if (this.desde && this.hasta && fechaHasta < fechaDesde) {
      this.error = 'La fecha "hasta" no puede ser anterior a la fecha "desde".';
      return; // Evitar emitir el filtro si hay un error
    }
  
    // Validar que si hay una fecha "desde", la "hasta" no debe estar vacía
    if (this.desde && !this.hasta) {
      this.error = 'Si selecciona una fecha "desde", debe seleccionar también una fecha "hasta".';
      return;
    }
  
    // Validar que si hay una fecha "hasta", la "desde" no debe estar vacía
    if (this.hasta && !this.desde) {
      this.error = 'Si selecciona una fecha "hasta", debe seleccionar también una fecha "desde".';
      return;
    }
  
    // Resetear el error si las fechas son válidas
    this.error = '';
    this.filtroAplicado.emit({
      desde: this.desde,
      hasta: this.hasta,
      producto: this.producto
    });
  }

  eliminarFiltros() {
    this.desde = '';
    this.hasta = '';
    this.producto = '';
    this.error = '';

    // Emitir un evento para indicar que se han eliminado los filtros
    this.filtrosEliminados.emit();
  }
}
