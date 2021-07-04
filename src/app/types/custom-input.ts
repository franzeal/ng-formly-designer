import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'custom-formly-field-input',
  template: `
        <input [type]="type" [formControl]="strictFormControl" class="form-control"
            [formlyAttributes]="field" [ngClass]="{'form-control-danger': formControl.valid}">
    `,
})
export class FormlyFieldCustomInputComponent extends FieldType {
  get type(): string {
    return this.to.type || 'text';
  }

  get strictFormControl(): FormControl {
    return super.formControl as FormControl;
  }
}
