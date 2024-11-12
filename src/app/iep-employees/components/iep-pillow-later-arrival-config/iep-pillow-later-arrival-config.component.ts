import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { EmpPostConfiguration } from '../../Models/emp-post-configuration';
import { PillowTimeLateArrivalService } from '../../services/pillow-time-late-arrival.service';
@Component({
  selector: 'app-iep-pillow-later-arrival-config',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './iep-pillow-later-arrival-config.component.html',
  styleUrl: './iep-pillow-later-arrival-config.component.css'
})
export class IepPillowLaterArrivalConfigComponent {

  configForm: FormGroup= new FormGroup({});
  savedValue: number | null = 10;
  successMessage: string = '';

  savedDaysValue: number | null = 0;

  constructor(
    private fb: FormBuilder,
    private pillowTimeLateArrivalService: PillowTimeLateArrivalService
  )
  {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadSavedConfig();
  }

  private initForm(): void {
    this.configForm = this.fb.group({
      minutes: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(60)
      ]],
      days: ['', [Validators.required, Validators.min(0), Validators.max(30)]]
    });

    // Suscribirse a cambios del formulario para limpiar mensajes
    this.configForm.valueChanges.subscribe(() => {
      this.successMessage = '';
    });
  }

  private loadSavedConfig(): void {
    // Aquí podrías obtener la configuración desde un servicio
    // const savedConfig = localStorage.getItem('minutesBuffer');
    // if (savedConfig) {
    //   const minutes = parseInt(savedConfig, 10);
    //   this.configForm.patchValue({ minutes });
    //   this.savedValue = minutes;
    // }
  }

  onSubmit(): void {
    if (this.configForm.valid) {
      let empPostConfiguration: EmpPostConfiguration ={
        time: this.configForm.get('minutes')?.value,
        userId: 1,
        days: this.configForm.get('days')?.value
      }
      this.pillowTimeLateArrivalService.postConfig(empPostConfiguration).subscribe({
        next: () => {
          this.savedValue = this.configForm.get('minutes')?.value;
          this.savedDaysValue = this.configForm.get('days')?.value;
          this.successMessage = 'La configuración global ha sido actualizada exitosamente';
        },
        error: (error) => {
          console.error('Error al guardar la configuración:', error);
          
        }
      });
    } else {
      this.markFormGroupTouched(this.configForm);
    }
  }

  private saveConfiguration(minutes: number): void {
  
    // Simula una llamada a un servicio
    // localStorage.setItem('minutesBuffer', minutes.toString());
    // this.savedValue = minutes;
    // this.successMessage = 'La configuración global ha sido actualizada exitosamente';
    
    // Ejemplo de uso del servicio (comentado)
    // this.configService.saveGlobalMinutes(minutes).subscribe({
    //   next: () => {
    //     this.savedValue = minutes;
    //     this.successMessage = 'La configuración global ha sido actualizada exitosamente';
    //   },
    //   error: (error) => {
    //     console.error('Error al guardar la configuración:', error);
    //     // Manejar el error apropiadamente
    //   }
    // });


    
  }

  resetForm(): void {
    this.configForm.reset();
    this.successMessage = '';
  }

  // Helpers para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.configForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string, errorType: string): boolean {
    const field = this.configForm.get(fieldName);
    return field ? field.errors?.[errorType] : false;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
