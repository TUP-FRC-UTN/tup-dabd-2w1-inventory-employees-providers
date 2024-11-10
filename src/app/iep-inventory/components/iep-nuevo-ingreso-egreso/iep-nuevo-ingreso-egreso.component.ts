import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Route, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ProductService } from '../../services/product.service';
import { ProductXDetailDto } from '../../models/product-xdetail-dto';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/suppliers';
import { movementDto } from '../../models/movementDto';
import { Observable, map, catchError, of } from 'rxjs';
import { IncreaseDecrementService } from '../../services/increase-decrement.service';
import Swal from 'sweetalert2';
import { UsersMockIdService } from '../../../common-services/users-mock-id.service';

@Component({
  selector: 'app-iep-nuevo-ingreso-egreso',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule,NgSelectComponent,RouterLink],
  templateUrl: './iep-nuevo-ingreso-egreso.component.html',
  styleUrl: './iep-nuevo-ingreso-egreso.component.css'
})
export class IepNuevoIngresoEgresoComponent implements OnInit {


  idUser=0
  formulario:FormGroup = new FormGroup({});
  constructor(
    private router :Router ,
     private serviceP : ProductService ,
      private serviceS :  SuppliersService,
      private serviceMovment : IncreaseDecrementService,
      private serviceUsers : UsersMockIdService
    ) 
  {  
    
  }

  

  productos: ProductXDetailDto [] = [];
  suppliers : Supplier[]=[];
  
  ngOnInit(): void {
    this.formulario = new FormGroup({
      selectedType :new FormControl('I',Validators.required),
      selectedArticule: new FormControl('',Validators.required),  
      selectedSupplier : new FormControl('',Validators.required),
      amount : new FormControl(0,[Validators.required,Validators.min(1)]),
      priceUnit : new FormControl('',[Validators.required,Validators.min(1)]),
      justify : new FormControl('',Validators.required)
    });
    this.loadSuppliers();
    this.loadProductos();
    this.idUser= this.serviceUsers.getMockId()
  }

  goTo(path:string){
   
    this.router.navigate([path])
  }

  cancelar(){
    window.history.back()
  }
  onSubmit(){
    
   this.logErrors()
   console.log("perrra")
   const dto: movementDto = {
    amount: this.formulario.get('amount')?.value,
    date: new Date(Date.now()),
    unitPrice: this.formulario.get('priceUnit')?.value,
    productId: this.formulario.get('selectedArticule')?.value,
    movementType: this.formulario.get('selectedType')?.value,
    supplierId: this.formulario.get('selectedSupplier')?.value
    };
this.serviceMovment.createMovement(dto,this.idUser).subscribe({
    next: response => {
      console.log(JSON.stringify(response))
      Swal.fire({
        title: '¡Guardado!',
        text: "Movimiento guardado con exito",
        icon: 'success',
        confirmButtonText: 'Aceptar',
        showCancelButton: false,
        confirmButtonColor: '#3085d6'
      }).then(() => {
        this.formulario.reset()
      });
      console.log("PASO: ", response);
    },
    error: error => {
      
      Swal.fire({
        title: 'Error',
        text: "Error en el servidor intente nuevamente mas tarde",
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
   
      console.log("error:"+error.error.message)
      console.error(error);
             
    }})}

  logErrors() {
    Object.keys(this.formulario.controls).forEach(controlName => {
      const control = this.formulario.get(controlName);
      if (control && control.errors) {
        console.log(`Errors for ${controlName}:`, control.errors);
      }
    });
  }




  loadProductos(){

  this.serviceP.getAllProducts().subscribe((data : ProductXDetailDto[] )=>{

    this.productos=[]
    data.forEach(x =>{
      if(!x.discontinued){this.productos.push(x)
        
      }
      else{console.log("EL DESCONTINUADO")
        console.log(x)}     
    })  
   
  })
}
   
   loadSuppliers(){

    this.serviceS.getAll().subscribe((data : Supplier[]) =>{

      this.suppliers = data
      console.log(this.suppliers)
    })
   }

   stockInsuficiente(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const id = this.formulario.get('selectedArticule')?.value;
        const cantidad = control.value;

        // Validamos que esté seleccionado el id y la cantidad no sea 0
        if (id && cantidad) {
            return this.serviceP.getAllProducts().pipe(
                map((data: ProductXDetailDto[]) => {
                    const producto = data.find(p => p.id === id);
 
                    if (!producto || producto.discontinued) {
                        return { noExistProduct: true }; // Producto no existe
                    }

                    if (producto.stock < cantidad) { 
                        return { insuficientStock: true }; // Stock insuficiente
                    }

                    return null; // Sin errores
                }),
                catchError((error) => {
                    console.error(error);
                    return of(null); // Si ocurre un error, no devuelve error de validación
                })
            );
        }

        return of(null); // Si no hay id o cantidad, no hay error
    }} 




  
}
