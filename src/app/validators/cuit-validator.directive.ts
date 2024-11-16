// validators/cuit-validator.directive.ts
import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, ValidationErrors, Validator } from '@angular/forms';
import { cuitValidator } from './culit-validator';


@Directive({
  selector: '[cuitValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: CuitValidatorDirective,
      multi: true
    }
  ]
})
export class CuitValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return cuitValidator(control);
  }
}