import { Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FieldsService, FormlyDesignerConfig } from '..';
import { cloneDeep, isObject, isString } from '../util';

const FIELD_EDITOR_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FieldEditorComponent),
  multi: true
};

@Component({
  selector: 'formly-designer-field-editor',
  template: `
    <form [formGroup]="form" novalidate>
      <div class="card">
        <div class="card-header" [ngClass]="{solo: !hasContent && fields.length === 0}">
          <div class="form-group" [ngClass]="{'has-danger': form.hasError('key') && (key.dirty || key.touched)}">
            <label class="form-control-label">key</label>
            <input formControlName="key" class="form-control">
            <div *ngIf="form.hasError('key') && (key.dirty || key.touched)" class="form-control-feedback">
              key required.
            </div>
          </div>
          <div *ngIf="formlyDesignerConfig.settings.showClassName" class="form-group">
            <label class="form-control-label">className</label>
            <input formControlName="className" class="form-control">
          </div>
          <div *ngIf="fieldGroup && formlyDesignerConfig.settings.showClassName" class="form-group">
            <label class="form-control-label">fieldGroupClassName</label>
            <input formControlName="fieldGroupClassName" class="form-control">
          </div>
          <div *ngIf="showType" class="form-group"
            [ngClass]="{'has-danger': form.hasError('type') && (type.dirty || type.touched)}">
            <label class="form-control-label">type</label>
            <formly-designer-type-select formControlName="type" [fieldGroup]="fieldGroup" [type]="type.value"></formly-designer-type-select>
            <div *ngIf="form.hasError('type') && (type.dirty || type.touched)" class="form-control-feedback">
              type required.
            </div>
          </div>
          <div *ngIf="showWrappers" class="form-group">
            <label class="form-control-label">wrappers</label>
            <formly-designer-wrappers-picker [field]="field"
              (selected)="onWrappersSelected($event)">
            </formly-designer-wrappers-picker>
          </div>
        </div>
        <div #block class="card-body">
          <formly-form *ngIf="fields.length > 0" [form]="fieldForm" [fields]="fields" [model]="field">
          </formly-form>
          <ng-content></ng-content>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .card-header.solo {
      border-bottom: 0;
    }
    .card-header.solo + .card-body {
      display: none;
    }
  `],
  providers: [
    FIELD_EDITOR_CONTROL_VALUE_ACCESSOR
  ]
})
export class FieldEditorComponent implements ControlValueAccessor, OnDestroy, OnInit {
  @Input() fieldGroup: boolean;
  @Input() showType: boolean;
  @Input() showWrappers: boolean;
  @Input() hasContent: boolean;
  @ViewChild('block', { static: true }) blockElRef: ElementRef;

  private readonly subscriptions: Subscription[] = [];
  private valueChangesSubscription: Subscription;

  constructor(
    private fieldsService: FieldsService,
    private fb: FormBuilder,
    public formlyDesignerConfig: FormlyDesignerConfig
  ) {
    this.form = fb.group({
      key: this.key = fb.control(''),
      className: this.className = fb.control(''),
      fieldGroupClassName: this.fieldGroupClassName = fb.control(''),
      type: this.type = fb.control('')
    }, { validator: (control) => this.validator(control) });
    this.fieldForm = fb.group({});
  }

  readonly form: FormGroup;
  readonly key: FormControl;
  readonly className: FormControl;
  readonly fieldGroupClassName: FormControl;
  readonly type: FormControl;

  fieldForm: FormGroup;
  field: FormlyFieldConfig = {};
  fields: FormlyFieldConfig[] = [];
  fieldArray: boolean;
  invalid: boolean;

  protected onChange = (_: any) => { };
  protected onTouched = () => { };

  ngOnInit(): void {
    this.subscriptions.push(this.type.valueChanges
      .subscribe(() => this.onTypeChange()));

    this.subscriptions.push(this.form.statusChanges
      .pipe(debounceTime(0))
      .subscribe(() => this.invalid = this.form.invalid));

    this.subscribeValueChanges();
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription.unsubscribe();
    this.subscriptions.splice(0).forEach(subscription => subscription.unsubscribe());
  }

  writeValue(obj: any) {
    this.valueChangesSubscription.unsubscribe();
    this.updateField(obj);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.subscribeValueChanges();
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  private subscribeValueChanges(): void {
    this.valueChangesSubscription = merge(this.fieldForm.valueChanges, this.form.valueChanges)
      .pipe(debounceTime(0))
      .subscribe(() => this.updateValue());
  }

  private updateField(field: FormlyFieldConfig): void {
    if (!isObject(field)) {
      field = {};
    }
    this.key.setValue(isString(field.key) ? field.key : '');
    this.className.setValue(isString(field.className) ? field.className : '');
    this.fieldGroupClassName.setValue(isString(field.fieldGroupClassName) ? field.fieldGroupClassName : '');
    this.type.setValue(isString(field.type) ? field.type : '');
    this.fields = this.fieldsService.getTypeFields(this.type.value);
    this.fieldForm = this.fb.group({});
    this.field = cloneDeep(field);
  }

  private updateValue(): void {
    if (!this.onChange) {
      return;
    }

    const field = this.field;
    field.key = this.key.value;
    field.className = this.className.value;
    field.fieldGroupClassName = this.fieldGroupClassName.value;
    field.type = this.type.value;
    this.onChange(field);
  }

  private onTypeChange(): void {
    this.valueChangesSubscription.unsubscribe();
    const type = this.type.value;
    this.fields = this.fieldsService.getTypeFields(type);
    const designerType = this.formlyDesignerConfig.types[type];
    this.fieldArray = designerType && designerType.fieldArray;
    this.fieldForm = this.fb.group({});
    this.field = Object.assign({}, this.field);
    this.subscribeValueChanges();
  }

  onWrappersSelected(field: FormlyFieldConfig): void {
    this.updateField(field);
  }

  private validator(control: FormGroup): { [key: string]: boolean } {
    if (this.fieldGroup) {
      return null;
    }
    const type = control.get('type') as FormControl;
    const hasType = isString(type.value) && type.value.trim().length > 0;
    const key = control.get('key') as FormControl;
    const result = { key: false, type: false, conflict: false };
    if (this.showType && !hasType) {
      result.type = true;
    }
    if (hasType && (!isString(key.value) || key.value.trim().length === 0)) {
      result.key = true;
    }
    return result.key || result.type ? result : null;
  }
}
