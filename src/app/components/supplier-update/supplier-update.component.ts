import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProvidersService } from '../../services/providers.service';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/suppliers';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { error } from 'jquery';

@Component({
  selector: 'app-supplier-update',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './supplier-update.component.html',
  styleUrl: './supplier-update.component.css'
})
export class SupplierUpdateComponent implements OnInit{

  proveedorForm!: FormGroup;
  
onSubmit() {
if(this.proveedorForm.valid){
  this.supplierService.updateSupplier(this.id,this.proveedorForm.value).subscribe(
    response => {
      alert('Proveedor actualizado exitosamente');
    },
    error => {
      alert('Error al actualizar el proveedor');
    }
  );
}
}
 

  supplierUpdate?:Supplier;

  ngOnInit(): void {
    
    this.proveedorForm = this.fb.group({
      name: [this.supplierUpdate?.name, Validators.required],
      healthInsurance: [this.supplierUpdate?.healthInsurance, Validators.required],
      phoneNumber: [this.supplierUpdate?.phoneNumber, [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: [this.supplierUpdate?.email, [Validators.required, Validators.email]],
      supplierType: [this.supplierUpdate?.supplierType, Validators.required],
      address: [this.supplierUpdate?.address, Validators.required],
      description: [this.supplierUpdate?.description],
      createdUser: [0],
      authorized: [this.supplierUpdate?.authorized],
      discontinued:[this.supplierUpdate?.discontinued]
    });
  }


  id:number=0;
  searchSupplier(){
    this.id = Number(this.activateRoute.snapshot.paramMap.get('id'));
    if (this.id) {
      const numericId = +this.id; 
      this.supplierService.getSupplierById(numericId)
      .subscribe(arg => this.supplierUpdate = arg);
    } else {
      console.error('ID no válido');
    }

  }

constructor(private activateRoute:ActivatedRoute,private supplierService:SuppliersService,private fb: FormBuilder){}

}
