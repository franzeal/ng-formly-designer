import { AfterViewInit, Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { FormlyDesignerConfig } from '../formly-designer-config';

const TYPE_SELECT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TypeSelectComponent),
  multi: true
};

@Component({
  selector: 'formly-designer-type-select',
  template: `
    <select [formControl]="formControl" class="custom-select">
      <option *ngFor="let type of types" [ngValue]="type.value">{{ type.label }}</option>
    </select>
  `,
  styles: [`
    select {
      width: 100%;
    }
  `],
  providers: [TYPE_SELECT_CONTROL_VALUE_ACCESSOR]
})
export class TypeSelectComponent implements AfterViewInit, ControlValueAccessor, OnChanges, OnInit, OnDestroy {
  private valueChangesSubscription: Subscription;

  @Input() type?: string;
  @Input() fieldGroup?: boolean;
  formControl = new FormControl();
  types: { label: string; value: string }[];

  constructor(
    private formlyDesignerConfig: FormlyDesignerConfig
  ) { }

  protected onChange = (value: any) => { };
  protected onTouched = () => { };

  ngAfterViewInit(): void {
    this.updateTypes();
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change.fieldGroup) {
      this.updateTypes();
    }
  }

  ngOnInit(): void {
    this.valueChangesSubscription = this.formControl.valueChanges.subscribe(value => {
      if (this.onChange) {
        this.onChange(value);
      }
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription.unsubscribe();
  }

  writeValue(obj: any) {
    this.formControl.setValue(obj);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  private updateTypes(): void {
    timer().subscribe(() => {
      this.types = this.getTypes();
      const type = this.fieldGroup && (this.type == null || this.type === '') ? 'formly-group' : this.type;
      if (this.types.some(option => option.value === type)) {
        this.formControl.setValue(type);
      } else if (this.types.length > 0) {
        this.formControl.setValue(this.types[0].value);
      }
    });
  }

  private getTypes(): { label: string, value: string }[] {
    const types: { label: string, value: string }[] = [];
    const entries = Object.entries(this.formlyDesignerConfig.types);
    if (this.fieldGroup !== true) {
      entries.forEach(([key, value]) => {
        if (!value.fieldGroup) {
          types.push({ label: key, value: key });
        }
      });
    }
    if (this.fieldGroup !== false) {
      types.push({ label: 'fieldGroup', value: 'formly-group' });
    }
    if (this.fieldGroup !== false) {
      entries.forEach(([key, value]) => {
        if (value.fieldGroup) {
          types.push({ label: key, value: key });
        }
      });
    }
    return types;
  }
}
