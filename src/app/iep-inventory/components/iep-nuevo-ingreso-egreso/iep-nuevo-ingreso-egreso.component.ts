import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-iep-nuevo-ingreso-egreso',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule,NgSelectComponent],
  templateUrl: './iep-nuevo-ingreso-egreso.component.html',
  styleUrl: './iep-nuevo-ingreso-egreso.component.css'
})
export class IepNuevoIngresoEgresoComponent implements OnInit {


  movimientoForm:FormGroup = new FormGroup({});
  tipoMovimiento:string="I";
  
  constructor() {
  
  }
  ngOnInit(): void {
    this.movimientoForm = new FormGroup({
     
  });

  }

  setTipoMovimiento(option: string) {
    this.movimientoForm.get('tipoMovimiento')?.setValue(option);
  }

 

  // Este método se llama cada vez que cambia el valor del tipo de movimiento
  cambio(v : string) {
    this.tipoMovimiento = v
    console.log('Tipo Movimiento cambiado a:', this.tipoMovimiento);
    // Aquí puedes agregar cualquier lógica que desees ejecutar cuando cambie el valor
  }

}
