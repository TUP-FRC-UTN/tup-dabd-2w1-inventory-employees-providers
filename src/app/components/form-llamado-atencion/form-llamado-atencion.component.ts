import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup,FormArray, ReactiveFormsModule, Validators, NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LlamadoAtencionService } from "../../services/llamado-atencion.service";
import { EmployeeGetResponseDTO } from "../../models/llamado-atencion";
import { Router } from '@angular/router';
import { HttpErrorResponse } from "@angular/common/http";
import { RequestWakeUpCallDTO, RequestWakeUpCallGroupDTO } from "../../models/llamado-atencion";

@Component({
  selector: 'app-form-llamado-atencion',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule],
  templateUrl: './form-llamado-atencion.component.html',
  styleUrl: './form-llamado-atencion.component.css'
})
export class FormLlamadoAtencionComponent implements OnInit{
  wakeUpCallForm: FormGroup;
  confirmationMessage: string = '';
  errorMessage: string = '';
  showConfirmation: boolean = false;
  showError: boolean = false;
  employees: EmployeeGetResponseDTO[] = [];
  filteredEmployees: EmployeeGetResponseDTO[] = [];
  searchTerm: string = '';

  constructor(private router: Router, private fb: FormBuilder, private wakeUpCallService: LlamadoAtencionService) {
    this.wakeUpCallForm = this.fb.group({
      empleados: this.fb.array([], Validators.required),
      fecha: ['', Validators.required],
      desempeno: ['', Validators.required],
      observaciones: ['', Validators.required],
      searchTerm: ['', [Validators.minLength(3)]]
    });
  }

  navigateToPerformanceList(): void {
    this.router.navigate(['/listado-desempeño']);  // Redirige al listado de desempeño
  }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.wakeUpCallService.getAllEmployees().subscribe(
      (employees) => {
        this.employees = employees;
        this.filteredEmployees = employees;  // Inicializa la lista filtrada
        this.addCheckboxes(); // Agrega checkboxes para todos los empleados al inicio
      },
      (error) => {
        console.error('Error al cargar empleados', error);
        this.confirmationMessage = 'Error al cargar la lista de empleados. Por favor, recargue la página.';
        this.showConfirmation = true;
      }
    );
  }

  private addCheckboxes() {
    this.empleadosFormArray.clear(); // Limpiar checkboxes existentes
    this.filteredEmployees.forEach(() => this.empleadosFormArray.push(this.fb.control(false)));
  }

  get empleadosFormArray() {
    return this.wakeUpCallForm.controls['empleados'] as FormArray;
  }

  filterEmployees() {
    const searchTerm = this.wakeUpCallForm.get('searchTerm')?.value || ''; // Obtener el valor del control
    if (searchTerm.length >= 3) {
      this.filteredEmployees = this.employees.filter(employee =>
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.filteredEmployees = this.employees;  // Muestra todos los empleados si el término es menor a 3 caracteres
    }
    this.empleadosFormArray.clear();  // Limpiar el FormArray
    this.addCheckboxes();  // Reagregar checkboxes para los empleados filtrados
  }
  

  
  onSubmit() {
    if (this.wakeUpCallForm.valid) {
      const formValues = this.wakeUpCallForm.value;
      const selectedEmployeeIds = this.filteredEmployees
        .filter((_, i) => formValues.empleados[i])
        .map(e => e.id);

      const request: RequestWakeUpCallGroupDTO = {
        empleadoIds: selectedEmployeeIds,
        fecha: formValues.fecha,
        desempeno: formValues.desempeno,
        observation: formValues.observaciones,
        lastUpdateUser: 1,
        created_user: 1
      };

      this.wakeUpCallService.crearWakeUpCallGrupo(request).subscribe(
        response => {
          console.log('WakeUpCall grupal creado', response);
          this.showSuccessMessage('¡Llamado registrado exitosamente!');
          this.resetForm();
        },
        error => {
          console.error('Error al registrar', error);
          this.showErrorMessage(error);
        }
      );
    }
  }

  private showSuccessMessage(message: string) {
    this.confirmationMessage = message;
    this.showConfirmation = true;
    this.showError = false;
    setTimeout(() => this.showConfirmation = false, 3000);
  }

  private showErrorMessage(error: string) {
    this.errorMessage = error;
    this.showError = true;
    this.showConfirmation = false;
    setTimeout(() => this.showError = false, 5000);
  }

  private resetForm() {
    this.wakeUpCallForm.reset();
    this.empleadosFormArray.clear();
    this.addCheckboxes();
  }
}
