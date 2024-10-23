import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChargeResponse } from '../../models/charge-response';
import { ChargeService } from '../../services/charge.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-iep-cargo-put',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './iep-cargo-put.component.html',
  styleUrl: './iep-cargo-put.component.css'
})
export class IepCargoPutComponent implements OnInit {
  cargoForm: FormGroup;
  cargoId: number | undefined;
  cargos: ChargeResponse[] = [];
  selectedCargo: any;

  constructor(
    private fb: FormBuilder,
    private cargoService: ChargeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.cargoForm = this.fb.group({
      charge: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  onChargeChange(event: Event): void {
    const cargoId = (event.target as HTMLSelectElement).value; 
    this.selectedCargo = this.cargos.find(cargo => cargo.id === +cargoId); 
  
    if (this.selectedCargo) {
      this.cargoForm.patchValue({
        description: this.selectedCargo.description
      });
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.cargoId = +params['id'];
      this.loadCargoData();          
      this.loadCargos();              
    });
  }

  loadCargoData() {
    if (this.cargoId !== undefined) {
      this.cargoService.getCargo(this.cargoId).subscribe(
        (cargo: ChargeResponse) => {
          this.cargoForm.patchValue({
            charge: cargo.id,
            description: cargo.description
          });
        },
        error => {
          console.error('Error loading cargo', error);
        }
      );
    } else {
      console.error('Cargo ID is undefined');
    }
  }

  loadCargos() {
    this.cargoService.getAllCargos().subscribe(
      (cargos: ChargeResponse[]) => {
        this.cargos = cargos; 
      },
      error => {
        console.error('Error loading cargos', error);
      }
    );
  }

  onSubmit(): void {
    if (this.cargoForm.valid) {
      const updatedCargo = {
        charge: this.cargoForm.value.charge,
        description: this.cargoForm.value.description
      };

      this.cargoService.updateCargo(this.selectedCargo.id, updatedCargo).subscribe({
        next: (response) => {
          alert('Cargo actualizado con éxito');
          this.cargoForm.reset();
        },
        error: (error) => {
          console.error('Error al actualizar el cargo', error);
        }
      });
    }
  }

  markAllControlsAsTouched() {
    Object.keys(this.cargoForm.controls).forEach(key => {
      this.cargoForm.get(key)?.markAsTouched();
    });
  }


  onCancel() {
    this.router.navigate(['/cargos']);
  }

}
