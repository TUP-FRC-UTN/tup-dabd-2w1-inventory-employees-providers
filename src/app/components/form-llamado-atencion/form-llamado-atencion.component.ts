import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup,FormArray, ReactiveFormsModule, Validators, NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LlamadoAtencionService } from "../../services/llamado-atencion.service";
import { EmployeeGetResponseDTO } from "../../models/llamado-atencion";
import { Router } from '@angular/router';
import { HttpErrorResponse } from "@angular/common/http";
import { RequestWakeUpCallDTO, RequestWakeUpCallGroupDTO } from "../../models/llamado-atencion";
import { ListadoDesempeñoService } from "../../services/listado-desempeño.service";

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
  dateFilteredEmployees: EmployeeGetResponseDTO[] = []; // Nueva propiedad para almacenar empleados filtrados por fecha
  searchTerm: string = '';

  constructor(
    private router: Router, 
    private fb: FormBuilder, 
    private wakeUpCallService: LlamadoAtencionService,
    private ListDesempeño:ListadoDesempeñoService
  ) {
    this.wakeUpCallForm = this.fb.group({
      empleados: this.fb.array([], Validators.required),
      fecha: ['', Validators.required],
      desempeno: ['', Validators.required],
      observaciones: ['', Validators.required],
      searchTerm: ['', [Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.loadEmployees();
    
    // Suscribirse a cambios en la fecha
    this.wakeUpCallForm.get('fecha')?.valueChanges.subscribe(date => {
      if (date) {
        this.loadEmployeesForDate(date);
      } else {
        this.dateFilteredEmployees = [];
        this.filteredEmployees = [];
        this.addCheckboxes();
      }
    });

    // Suscribirse a cambios en el término de búsqueda
    this.wakeUpCallForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterEmployees();
    });
  }

  loadEmployees() {
    this.wakeUpCallService.getAllEmployees().subscribe(
      (employees) => {
        this.employees = employees;
        const fecha = this.wakeUpCallForm.get('fecha')?.value;
        if (fecha) {
          this.loadEmployeesForDate(fecha);
        } else {
          this.filteredEmployees = [];
          this.addCheckboxes();
        }
      },
      (error) => {
        console.error('Error al cargar empleados', error);
        this.showErrorMessage('Error al cargar la lista de empleados');
      }
    );
  }

  loadEmployeesForDate(date: string) {
    this.wakeUpCallService.getMovements(date).subscribe(
      (documents) => {
        this.dateFilteredEmployees = this.employees.filter(employee => 
          documents.includes(employee.document)
        );
        this.filterEmployees(); // Aplicar el filtro de búsqueda sobre los empleados filtrados por fecha
      },
      (error) => {
        console.error('Error al cargar movimientos', error);
        this.showErrorMessage('Error al cargar los movimientos de empleados');
      }
    );
  }

  filterEmployees() {
    const searchTerm = this.wakeUpCallForm.get('searchTerm')?.value?.toLowerCase() || '';
    const employeesToFilter = this.dateFilteredEmployees.length > 0 ? 
      this.dateFilteredEmployees : 
      [];

    if (searchTerm.length >= 3) {
      this.filteredEmployees = employeesToFilter.filter(employee =>
        employee.fullName.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredEmployees = employeesToFilter;
    }
    
    this.addCheckboxes();
  }

  private addCheckboxes() {
    this.empleadosFormArray.clear();
    this.filteredEmployees.forEach(() => 
      this.empleadosFormArray.push(this.fb.control(false))
    );
  }

  get empleadosFormArray() {
    return this.wakeUpCallForm.controls['empleados'] as FormArray;
  }

  onSubmit() {
    if (this.wakeUpCallForm.valid) {
      const formValues = this.wakeUpCallForm.value;
      const selectedEmployeeIds = this.filteredEmployees
        .filter((_, i) => formValues.empleados[i])
        .map(e => e.id);

      if (selectedEmployeeIds.length === 0) {
        this.showErrorMessage('Debe seleccionar al menos un empleado');
        return;
      }

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
          this.ListDesempeño.refreshData();
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
    this.dateFilteredEmployees = [];
    this.filteredEmployees = [];
    this.empleadosFormArray.clear();
  }

  navigateToPerformanceList(): void {
    this.router.navigate(['/listado-empleados']);
  }
}
