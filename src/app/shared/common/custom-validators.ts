import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { whitespace: true };
    };
  }


  static phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneNumber = control.value || '';
      const isValid = /^[0-9]{10}$/.test(phoneNumber); // Checks if it's exactly 10 digits
      return isValid ? null : { invalidPhoneNumber: true };
    };
  }

  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value || '';
      const isValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email); // Basic email format
      return isValid ? null : { invalidEmail: true };
    };
  }

  static numberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const numberValue = control.value || '';
      const isValid = /^-?\d+(\.\d+)?$/.test(numberValue); // Accepts integers and floats
      return isValid ? null : { invalidNumber: true };
    };
  }

  static imageFileValidator(allowedTypes: string[] = ['image/jpeg', 'image/png'], maxSizeMB: number = 2) {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file) {
        return null; // If no file is selected, no validation error
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return { invalidFileType: true };
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return { fileTooLarge: true };
      }

      return null;
    };
  }
}