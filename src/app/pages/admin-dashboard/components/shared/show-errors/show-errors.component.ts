import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
type ValidationErrorValue = {
  requiredLength?: string;
  requiredPattern?: string;
  min?: string;
};
@Component({
  selector: 'app-show-errors',
  templateUrl: './show-errors.component.html',
  styleUrls: ['./show-errors.component.scss'],
  animations: [
    trigger('slideInError', [
      state(
        'void',
        style({
          height: '0px',
          opacity: 0,
          overflow: 'hidden',
          transform: 'translateY(-10px)',
        }),
      ),
      state(
        '*',
        style({
          height: '*',
          opacity: 1,
          overflow: 'visible',
          transform: 'translateY(0)',
        }),
      ),
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [],
})
export class ShowErrorsComponent {
  @Input() control: AbstractControl | null = null;
  @Input() requiredField: string = '';

  shouldShowError(): boolean {
    return !!(
      this.control &&
      this.control.invalid &&
      (this.control.dirty || this.control.touched)
    );
  }

  get errorMessage(): string {
    if (!this.control) {
      return '';
    }

    const errors = this.control.errors;

    if (!errors) {
      return '';
    }

    const errorMessages: string[] = [];

    Object.keys(errors).forEach((errorKey) => {
      const errorMessage = this.getErrorMsg(errorKey, errors[errorKey]);
      if (errorMessage) {
        errorMessages.push(errorMessage);
      }
    });
    return errorMessages.join(' ');
  }

  getErrorMsg(errorKey: string, errorValue: ValidationErrorValue): string {
    switch (errorKey) {
      case 'required':
        return `El campo ${this.requiredField} es requerido.`;
      case 'minlength':
        return `Este campo debe tener al menos ${(errorValue as { requiredLength: string }).requiredLength} caracteres.`;
      case 'maxlength':
        return `Este campo debe tener máximo ${(errorValue as { requiredLength: string }).requiredLength} caracteres.`;
      case 'email':
        return 'El email ingresado no es válido.';
      case 'min':
        return `El valor mínimo permitido en el campo ${this.requiredField} es ${(errorValue as { min: string }).min}.`;
      case 'pattern':
        switch (errorValue.requiredPattern) {
          case '^[1-9][0-9]*$':
            return 'No puede iniciar con 0.';
          case '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#.$%^&*()]).*$':
            return 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.';
          default:
            return 'no cumple con las validaciones requeridas.';
        }
      case 'matchingPasswords':
        return 'Las contraseñas no coinciden, por favor verifique.';
      case 'incompleteSelection':
        return 'La selección esta incompleta.';
      case 'forbiddenContent':
        return `Contenido prohibido: ${JSON.stringify(errorValue)}`;
      default:
        return `Error: ${errorKey} - ${JSON.stringify(errorValue)}`;
    }
  }
}
