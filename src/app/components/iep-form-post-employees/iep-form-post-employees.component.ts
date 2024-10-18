import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EmpPostEmployeeService } from '../../services/emp-post-employee.service';
import { Ciudad, Provincia } from '../../models/emp-provincia';
import { Observable } from 'rxjs';
import { Provider } from '../../models/provider';
import { Supplier } from '../../models/suppliers';

@Component({
  selector: 'app-iep-form-post-employees',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './iep-form-post-employees.component.html',
  styleUrl: './iep-form-post-employees.component.css',
})
export class IEPFormPostEmployeesComponent implements OnInit {
  constructor(private serviceCombos: EmpPostEmployeeService) {}

  nombre: string = '';
  apellido: string = '';
  cuil: string = '';
  dni?: number;
  telefono?: number;
  mail: string = '';
  calle: string = '';
  numeroCalle: string = '';
  piso: number = 0;
  dpto: string = '';
  codigoPostal: string = '';
  salario?: number;
  horaSalida: string = '';
  horaEntrada: string = '';
  startTimeContract?: Date;

  terciorizedEmployee: Boolean = false;

  invalidDate: Boolean = false;

  provincias: Provincia[] = [];

  suppliers: Supplier[] = [];

  selectedSupplier?: Supplier;
  localidades:Ciudad[]=[];
  provinciaSelect? : Provincia;
  localidadSelect?:Ciudad;


  public validateDate() {
    if (this.startTimeContract != null) {
      const today = new Date().setHours(0, 0, 0, 0);
      const selectedDate = new Date(this.startTimeContract).setHours(
        0,
        0,
        0,
        0
      );
      this.invalidDate = selectedDate < today;
      return;
    }
    // Si la fecha seleccionada es anterior a la actual, setea `isInvalidDate` en true
    this.invalidDate = false;
  }


  loadLocalidades(){

    if(this.provinciaSelect!= null){
    this.localidades=this.provinciaSelect?.ciudades
    }
  }
 


  public changeTerceorized() {
    this.terciorizedEmployee = !this.terciorizedEmployee;
  }

  public onSubmit(form: NgForm) {}

  public loadProvincias(): void {
    this.serviceCombos.getProvinces().subscribe({
      next: (provinciass) => {
        this.provincias = provinciass;
      },
    });
  }



  public loadSupplier(): void {
    this.serviceCombos.getProviders().subscribe({
      next: (supplierss) => {
        this.suppliers = supplierss;
      },
    });
  }

  public loadCombos() {
    
  }

  ngOnInit(): void {
   this.loadSupplier();
   this.loadProvincias();
   console.log(this.provincias)
  }







}
