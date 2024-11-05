import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { Router, RouterModule } from '@angular/router';
import { iepBackButtonComponent } from '../../../common-components/iep-back-button/iep-back-button.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-iep-suppliers-form',
  standalone: true,
  imports: [iepBackButtonComponent,ReactiveFormsModule,RouterModule,CommonModule],
  templateUrl: './iep-suppliers-form.component.html',
  styleUrl: './iep-suppliers-form.component.css'
})
export class IepSuppliersFormComponent {
  proveedorForm!: FormGroup;

  constructor(private fb: FormBuilder,private supplierService:SuppliersService,private router: Router) {}

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      healthInsurance: [0, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email]],
      supplierType: ['OTHER', Validators.required],
      address: ['', Validators.required],
      description: [''],
      createdUser: [0] ,
      discontinued:[false] 
    });
  }

  onSubmit() {

    Swal.fire({
      icon: "success",
      title: "Proveedor registrado",
      text: "El nuevo proveedor se ha registrado correctamente.",
      confirmButtonText: "Aceptar" 
    }).then(() => {
      this.router.navigate(['/home/suppliers']);
    });
    

    if (this.proveedorForm.valid) {
      const formData = this.proveedorForm.value;
      console.log(formData);
      this.supplierService.createSupplier(formData).subscribe((response) => {
        this.proveedorForm.reset();
        this.router.navigate(['/suppliers']);
        
      });
    }
  }



  isFieldInvalid(field: string): boolean {
    const control = this.proveedorForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
  goBack() {
    this.router.navigate(['/home/suppliers']);
  }
}
