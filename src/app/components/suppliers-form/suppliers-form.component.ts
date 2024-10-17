import { Component } from '@angular/core';
import { BotonVolverComponent } from "../boton-volver/boton-volver.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-suppliers-form',
  standalone: true,
  imports: [BotonVolverComponent,ReactiveFormsModule,RouterModule],
  templateUrl: './suppliers-form.component.html',
  styleUrl: './suppliers-form.component.css'
})
export class SuppliersFormComponent {
  proveedorForm!: FormGroup;

  constructor(private fb: FormBuilder,private supplierService:SuppliersService) {}

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      healthInsurance: [0, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email]],
      supplierType: ['OTHER', Validators.required],
      address: ['', Validators.required],
      description: [''],
      createdUser: [0]  
    });
  }

  onSubmit() {
    if (this.proveedorForm.valid) {
      const formData = this.proveedorForm.value;
      console.log(formData);
      this.supplierService.createSupplier(formData).subscribe((response) => {
        this.proveedorForm.reset();
        alert('Proveedoredor creado exitosamente');
        console.log(response);
      });
    }
  }
}
