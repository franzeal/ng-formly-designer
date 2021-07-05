import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DesignerTypeOption, FormlyDesignerConfig } from '../formly-designer-config';
import { FormlyDesignerService } from '../formly-designer.service';

@Component({
  selector: 'formly-designer-field-picker',
  template: `
    <form novalidate [formGroup]="form">
      <div class="form-group">
        <div class="input-group">
          <formly-designer-type-select formControlName="type">
          </formly-designer-type-select>
          <button type="button" class="btn btn-secondary" [disabled]="form.invalid" (click)="add()">
            Add
          </button>
        </div>
      </div>
      <div #modal class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Add {{ typeName }}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Cancel">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <formly-designer-field-editor #editor [fieldGroup]="fieldEdit.value.fieldGroup" [formControl]="fieldEdit">
              </formly-designer-field-editor>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" (click)="onApply()"
                [disabled]="editor.invalid">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .btn:not(:disabled) {
      cursor: pointer;
    }
    .input-group > .btn {
      border-radius: 0 .25rem .25rem 0;
    }
    .input-group, .modal-header {
      display: flex;
    }
    .modal-header {
      justify-content: space-between;
    }
    formly-designer-type-select {
      flex-grow: 2;
    }
  `]
})
export class FieldPickerComponent {
  @ViewChild('modal', { static: true }) modalRef: ElementRef;
  @Output() selected = new EventEmitter<FormlyFieldConfig>();

  constructor(
    fb: FormBuilder,
    private formlyDesignerConfig: FormlyDesignerConfig,
    private formlyDesignerService: FormlyDesignerService,
  ) {
    this.form = fb.group({
      type: this.type = fb.control('', Validators.compose([Validators.required, Validators.pattern(/^\s*\S.*$/)]))
    });
  }

  form: FormGroup;
  readonly fieldEdit = new FormControl({});
  readonly type: FormControl;
  fieldGroup: boolean;

  get typeName(): string {
    return this.formlyDesignerService.getTypeName(this.type.value);
  }

  private get $modal(): JQuery & { modal: (command: string) => void } {
    return $(this.modalRef.nativeElement) as any;
  }

  add(): void {
    const type = this.type.value;
    const field = {} as FormlyFieldConfig;
    if (type !== 'formly-group') {
      field.type = type;
    }
    const designerType = this.formlyDesignerConfig.types[type] || {} as DesignerTypeOption;
    if (designerType.fieldArray) {
      field.fieldArray = { fieldGroup: [] };
    }
    if (this.fieldGroup = (type === 'formly-group' || designerType.fieldGroup)) {
      field.fieldGroup = [];
    }
    this.fieldEdit.setValue(field);
    this.$modal.modal('show');
  }

  onApply(): void {
    this.selected.emit(this.fieldEdit.value);
    this.$modal.modal('hide');
  }
}
