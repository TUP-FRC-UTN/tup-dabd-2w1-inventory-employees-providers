import { CommonModule } from '@angular/common';
import { Component, importProvidersFrom, Inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EmpPostEmployeeService } from '../../services/emp-post-employee.service';
import { Ciudad, Provincia } from '../../models/emp-provincia';
import { Observable } from 'rxjs';
import { Provider } from '../../models/provider';
import { Supplier } from '../../models/suppliers';
import { AddressDto, Charge, PostEmployeeDto } from '../../models/emp-post-employee-dto';
import { post } from 'jquery';
@Component({
  selector: 'app-iep-form-post-employees',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './iep-form-post-employees.component.html',
  styleUrl: './iep-form-post-employees.component.css',
})
export class IEPFormPostEmployeesComponent implements OnInit {
  constructor(private serviceCombos: EmpPostEmployeeService) {}

  createEmployee$: Observable<any>= new Observable<any>();

  userId?: number
  nombre: string = '';
  apellido: string = '';
  cuil: string = '';
  dni?: number;
  telefono?: number;
  mail: string = '';
  calle: string = '';
  numeroCalle: number = 0;
  piso: number = 0;
  dpto: string = '';
  codigoPostal: string = '';
  salario?: number;
  horaSalida: string = '';
  horaEntrada: string = '';
  startTimeContract?: Date;

  lunes:boolean=false;
  martes:boolean=false;
  miercoles:boolean=false;
  jueves:boolean=false;
  viernes:boolean=false;
  sabado:boolean=false;
  domingo:boolean=false;

  success:boolean=false;
  errorMessage:string="";
  successMessage:string="";

  invalidDate: Boolean = false;

  provincias: Provincia[] = [];

  suppliers: Supplier[] = [];
  terciorizedEmployee: Boolean = false;

  selectedSupplier?: Supplier;
  localidades:Ciudad[]=[];
  cargos:Charge[]=[];

  cargoSelected?:Charge
  provinciaSelect? : Provincia;
  localidadSelect?:Ciudad;
  
  postDto:PostEmployeeDto = new PostEmployeeDto();
  adressDto:AddressDto =new AddressDto();
 

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



 


  public changeTerceorized() {
    this.terciorizedEmployee = !this.terciorizedEmployee;
  }

  public onSubmit(form: NgForm) {

      if(form.valid){
        if(this.adressDto!=null){

          this.adressDto.street=this.calle
          this.adressDto.city=this.provinciaSelect?.nombre
          this.adressDto.locality=this.provinciaSelect?.nombre
          this.adressDto.postal_code=this.codigoPostal
          this.adressDto.apartment=this.dpto
          this.adressDto.floor=this.piso
          this.adressDto.number_street=this.numeroCalle

          if(this.postDto!=null){
            this.postDto.name=this.nombre;
            this.postDto.surname=this.apellido;    
            this.postDto.documenValue=this.dni
            this.postDto.cuil=this.cuil;
            this.postDto.telephoneValue=this.telefono
            this.postDto.emailValue=this.mail;
            this.postDto.adressDto=this.adressDto
            this.postDto.salary=this.salario
            this.postDto.contractStartTime=this.startTimeContract
            this.postDto.startTime=this.horaEntrada
            this.postDto.endTime=this.horaSalida
            this.postDto.supplierId=this.selectedSupplier?.id
            this.postDto.mondayWorkday=this.lunes
            this.postDto.thursdayWorkday=this.martes
            this.postDto.wednesdayWorkday=this.miercoles
            this.postDto.thursdayWorkday=this.jueves
            this.postDto.fridayWorkday=this.viernes
            this.postDto.saturdayWorkday=this.sabado
            this.postDto.sundayWorkday=this.domingo
            this.postDto.charge=this.cargoSelected?.id
            this.postDto.userId=this.userId

            this.createEmployee$ = this.serviceCombos.createProduct(this.postDto);
            console.log(this.createEmployee$);
            this.createEmployee$.subscribe({
              next: response => {
                this.success = true;
                this.successMessage = response.message;
                console.log("PASO: ", response);
                form.reset();
              },
              //formatear estos errores y mostrar en modal succes y error
              error: error => {
                if(error.error.message === '400 Ya existe un producto con ese nombre') {
                  this.errorMessage = 'Ya existe un producto con ese nombre';
                }else if( error.error.message === '400 No existe el proveedor ingresado') {
                  this.errorMessage = 'No existe el proveedor ingresado';
                }else if( error.error.message === '400 No existe la categoria ingresada') {
                  this.errorMessage = 'La categoría ingresada no existe';
                }else if( error.error.message === '400 Estado invalido') {
                  this.errorMessage = 'El estado del producto ingresado es inválido';
                }else if( error.error.message === '500 Error al crear el producto') {
                  this.errorMessage = 'Ha ocurrido un error al crear el producto.';
                }else{
                  this.errorMessage = 'Ha ocurrido un error al crear el producto.';
                }
                console.error(error);
                this.success = false;
                form.reset();
              },
              complete: () => {
                console.log('Petición completada');
              }
            });

          }
        }
      }
    }
       

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


  public loadCharges(): void {
    this.serviceCombos.getCharges().subscribe({
      next: (c) => {
        this.cargos = c;
        console.log("cargoss"+c)
      },
    });
  }



 public loadLocalidades():void{

    if(this.provinciaSelect!= null){
    this.localidades=this.provinciaSelect?.ciudades
    }
  }

  


 




  ngOnInit(): void {
   this.loadSupplier();
   this.loadProvincias();
   this.loadCharges();
   console.log(this.provincias)
  }




  



}
