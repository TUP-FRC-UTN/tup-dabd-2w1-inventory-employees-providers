import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-iep-form-post-employees',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './iep-form-post-employees.component.html',
  styleUrl: './iep-form-post-employees.component.css'
})
export class IEPFormPostEmployeesComponent {


  nombre : String ="";
  apellido: String="";
  cuil:String="";
  dni?:number;
  telefono?:number;
  mail:String="";
  calle:String="";
  numeroCalle:String="";
  piso:number=0;
  dpto:String="";
  codigoPostal:String="";
  salario?:number;
  horaSalida:String = "";
  horaEntrada:String=""


  terciorizedEmployee: Boolean = false;



  public changeTerceorized(){
    this.terciorizedEmployee=!this.terciorizedEmployee
  }

}
