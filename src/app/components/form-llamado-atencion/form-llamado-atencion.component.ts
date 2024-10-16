import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup,FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LlamadoAtencionService } from "../../services/llamado-atencion.service";
import { EmployeeGetResponseDTO } from "../../models/llamado-atencion";
import { RequestWakeUpCallDTO, RequestWakeUpCallGroupDTO } from "../../models/llamado-atencion";

@Component({
  selector: 'app-form-llamado-atencion',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './form-llamado-atencion.component.html',
  styleUrl: './form-llamado-atencion.component.css'
})
export class FormLlamadoAtencionComponent implements OnInit{
  wakeUpCallForm: FormGroup;
  confirmationMessage: string = '';
  showConfirmation: boolean = false;
  employees: EmployeeGetResponseDTO[] = [];

  constructor(private fb: FormBuilder, private wakeUpCallService: LlamadoAtencionService) {
    this.wakeUpCallForm = this.fb.group({
      empleados: this.fb.array([], Validators.required),
      fecha: ['', Validators.required],
      desempeno: ['', Validators.required],
      observaciones: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.wakeUpCallService.getAllEmployees().subscribe(
      (employees) => {
        this.employees = employees;
        this.addCheckboxes();
      },
      (error) => {
        console.error('Error al cargar empleados', error);
        this.confirmationMessage = 'Error al cargar la lista de empleados. Por favor, recargue la página.';
        this.showConfirmation = true;
      }
    );
  }

  private addCheckboxes() {
    this.employees.forEach(() => this.empleadosFormArray.push(this.fb.control(false)));
  }

  get empleadosFormArray() {
    return this.wakeUpCallForm.controls['empleados'] as FormArray;
  }

  onSubmit() {
    if (this.wakeUpCallForm.valid) {
      const formValues = this.wakeUpCallForm.value;
      const selectedEmployeeIds = this.employees
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
          this.confirmationMessage = '¡Wake Up Call grupal agregado exitosamente!';
          this.showConfirmation = true;
          this.wakeUpCallForm.reset();
          this.empleadosFormArray.clear();
          this.addCheckboxes();
          
          setTimeout(() => {
            this.showConfirmation = false;
          }, 3000);
        },
        error => {
          console.error('Error al crear WakeUpCall grupal', error);
          this.confirmationMessage = 'Error al agregar Wake Up Call grupal. Por favor, intente nuevamente.';
          this.showConfirmation = true;
        }
      );
    }
  }
}
