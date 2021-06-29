import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyDesignerConfig } from '../formly-designer-config';
import { FormlyDesignerService } from '../formly-designer.service';
import { cloneDeep, isArray, isObject } from '../util';

declare var $;

@Component({
  selector: 'formly-designer-wrapper-picker',
  template: `
      <form novalidate [formGroup]="form">
        <div class="form-group">
          <div class="input-group">
            <formly-designer-wrapper-select formControlName="wrapper">
            </formly-designer-wrapper-select>
            <button type="button" class="btn btn-secondary" [disabled]="form.invalid" (click)="add()">
              Add
            </button>
          </div>
        </div>
        <div #modal class="modal fade" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Add {{ wrapper }}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Cancel">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <formly-designer-wrapper-editor #editor [formControl]="fieldEdit" [wrapper]="wrapper">
                </formly-designer-wrapper-editor>
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
    :host {
      width: inherit;
    }
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
    formly-designer-wrapper-select {
      flex-grow: 2;
    }
  `]
})
export class WrapperPickerComponent implements OnInit {
  @ViewChild('modal', { static: true }) modalRef: ElementRef;
  @Input() field: FormlyFieldConfig;
  @Output() selected = new EventEmitter<FormlyFieldConfig>();

  constructor(
    private formBuilder: FormBuilder,
    private formlyDesignerConfig: FormlyDesignerConfig,
    private formlyDesignerService: FormlyDesignerService
  ) { }

  form: FormGroup;
  fieldEdit = new FormControl({});

  get wrapper(): string {
    return this.form.get('wrapper').value;
  }

  private get $modal(): JQuery & { modal: (command: string) => void } {
    return $(this.modalRef.nativeElement);
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      wrapper: ['', Validators.compose([Validators.required, Validators.pattern(/^\s*\S.*$/)])]
    });
  }

  add(): void {
    if (isObject(this.field)) {
      const field = cloneDeep(this.field);
      if (isArray(field.wrappers) && field.wrappers.length > 0) {
        field.wrappers.splice(field.wrappers.length - 1, 0, this.wrapper);
      } else {
        field.wrappers = [this.wrapper];
      }
      this.fieldEdit.setValue(field);

      const fields = this.formlyDesignerConfig.wrappers[this.wrapper].fields;
      if (isArray(fields) && fields.length > 0) {
        this.$modal.modal('show');
      } else {
        this.onApply();
      }
    }
  }

  onApply(): void {
    this.field = this.formlyDesignerService.createPrunedField(this.fieldEdit.value);
    this.selected.emit(this.fieldEdit.value);
    this.$modal.modal('hide');
  }
}
