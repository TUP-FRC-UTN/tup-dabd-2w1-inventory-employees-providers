import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChargeService } from '../../services/charge.service';
import { ChargeRequest } from '../../models/charge-request';

@Component({
  selector: 'app-iep-cargo-post',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './iep-cargo-post.component.html',
  styleUrl: './iep-cargo-post.component.css'
})
export class IepCargoPostComponent {
  cargoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cargoService: ChargeService
  ) {
    this.cargoForm = this.fb.group({
      charge: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.cargoForm.valid) {
      const cargoData: ChargeRequest = this.cargoForm.value;
      this.cargoService.createCargo(cargoData).subscribe(
        response => {
          console.log('Cargo created successfully', response);
          alert('Cargo creado con éxito');
          this.cargoForm.reset();
        },
        error => {
          console.error('Error creating cargo', error);
        }
      );
    }
  }

  onCancel() {
    this.cargoForm.reset();
  }

}
