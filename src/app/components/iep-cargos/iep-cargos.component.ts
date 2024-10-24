import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Modal } from 'bootstrap';
import { ChargeResponse } from '../../models/charge-response';
import { ChargeService } from '../../services/charge.service';
import { ChargeRequest } from '../../models/charge-request';

@Component({
  selector: 'app-iep-cargos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './iep-cargos.component.html',
  styleUrl: './iep-cargos.component.css'
})
export class IepCargosComponent implements OnInit{
  cargoForm: FormGroup;
  cargos: ChargeResponse[] = [];
  selectedCargo: ChargeResponse | null = null;
  modoEdicion = false;
  modal: any;

  constructor(
    private fb: FormBuilder,
    private cargoService: ChargeService
  ) {
    this.cargoForm = this.fb.group({
      charge: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.loadCargos();
    this.modal = new Modal(document.getElementById('cargoModal')!);
  }

  loadCargos() {
    this.cargoService.getAllCargos().subscribe({
      next: (cargos: ChargeResponse[]) => {
        this.cargos = cargos;
      },
      error: (error) => {
        console.error('Error loading cargos', error);
      }
    });
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.selectedCargo = null;
    this.cargoForm.reset();
    this.modal.show();
  }

  abrirModalEditar(cargo: ChargeResponse) {
    this.modoEdicion = true;
    this.selectedCargo = cargo;
    this.cargoForm.patchValue({
      charge: cargo.charge,
      description: cargo.description
    });
    this.modal.show();
  }

  onSubmit() {
    if (this.cargoForm.valid) {
      if (this.modoEdicion && this.selectedCargo) {
        this.actualizarCargo();
      } else {
        this.crearCargo();
      }
    } else {
      this.markAllControlsAsTouched();
    }
  }

  private crearCargo() {
    const cargoData: ChargeRequest = this.cargoForm.value;
    this.cargoService.createCargo(cargoData).subscribe({
      next: (response) => {
        alert('Cargo creado con éxito');
        this.modal.hide();
        this.cargoForm.reset();
        this.loadCargos(); // Recargar la lista
      },
      error: (error) => {
        console.error('Error creating cargo', error);
      }
    });
  }

  private actualizarCargo() {
    if (this.selectedCargo) {
      const updatedCargo = this.cargoForm.value;
      this.cargoService.updateCargo(this.selectedCargo.id, updatedCargo).subscribe({
        next: (response) => {
          alert('Cargo actualizado con éxito');
          this.modal.hide();
          this.cargoForm.reset();
          this.loadCargos(); // Recargar la lista
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
    this.modal.hide();
    this.cargoForm.reset();
  }

  eliminarCargo(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este cargo?')) {
      this.cargoService.deleteCargo(id).subscribe({
        next: () => {
          alert('Cargo eliminado con éxito');
          this.loadCargos();
        },
        error: (error) => {
          console.error('Error al eliminar el cargo', error);
        }
      });
    }
  }

}
