import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component,OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StockAumentoService } from '../../services/stock-aumento.service';
import { Supplier } from '../../interfaces/suppliers';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-stock-aumento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './stock-aumento.component.html',
  styleUrls: ['./stock-aumento.component.css']
})
export class StockAumentoComponent implements OnInit {
  stockForm!: FormGroup;
  suppliers: Supplier[] = []; // Array para almacenar los proveedores
  message: string = '';
  error: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private stockService: StockAumentoService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadSuppliers(); // Cargar proveedores al iniciar
  }

  initializeForm() {
    this.stockForm = this.formBuilder.group({
      productId: ['', Validators.required],
      supplierId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required]
    });
  }

  loadSuppliers() { // Método para cargar proveedores
    this.stockService.getSuppliers().subscribe(
      (data: Supplier[]) => {
        this.suppliers = data;
      },
      error => {
        console.error('Error al cargar proveedores', error);
      }
    );
  }

  onSubmit() {
    if (this.stockForm.valid) {
        this.stockService.modifyStock(this.stockForm.value).subscribe(
            response => {
                this.message = response; // Ahora 'response' es un string
                this.error = false; // Resetear el estado de error
                this.stockForm.reset(); // Limpiar el formulario

                // Hacer que el mensaje desaparezca después de 5 segundos
                setTimeout(() => {
                    this.message = ''; // Oculta el mensaje después de 5 segundos
                }, 5000);
            },
            error => {
                this.message = `Error al modificar el stock: ${error.status} - ${error.message}`;
                this.error = true; // Marcar el estado de error
                console.error('Error al modificar el stock', error);

                // Hacer que el mensaje desaparezca después de 5 segundos
                setTimeout(() => {
                    this.message = ''; // Oculta el mensaje después de 5 segundos
                }, 5000);
            }
        );
    }
}

}