import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FieldsService, FormlyDesignerConfig, FormlyDesignerService } from '../';
import { cloneDeep } from '../util';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'formly-designer-properties',
  template: `
    <formly-designer-field-editor #editor [fieldGroup]="fieldGroup" [hasContent]="true" [showType]="true" [showWrappers]="true" [formControl]="fieldEdit">
      <div class="footer">
        <button (click)="cancel()" class="btn btn-secondary mr-1">Cancel</button>
        <button [disabled]="editor.invalid" (click)="accept()" class="btn btn-primary">Apply</button>
      </div>
    </formly-designer-field-editor>
  `
})
export class PropertiesComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  fieldGroup = false;
  fieldEdit = new FormControl({});
  private field: FormlyFieldConfig = null;

  @HostBinding('class.d-none')
  get hasField() { return this.field == null; }

  constructor(
    private fieldsService: FieldsService,
    private formlyDesignerConfig: FormlyDesignerConfig,
    private formlyDesignerService: FormlyDesignerService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.formlyDesignerService.designerFields$.subscribe(fields => {
        const designerId = this.field?.templateOptions?.$designerId;
        this.setField(this.fieldsService.find(designerId, fields));
      }),
      this.formlyDesignerService.fieldClicked$.subscribe(field => {
        this.setField(field);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.splice(0).forEach(subscription => subscription.unsubscribe());
  }

  remove(): void {
    this.formlyDesignerService.removeField(this.field);
  }

  accept(): void {
    if (!this.fieldsService.checkField(this.fieldEdit.value, this.formlyDesignerService.designerFields)) {
      return;
    }
    timer().subscribe(() => {
      this.formlyDesignerService.updateField(this.field, this.fieldEdit.value);
    });
  }

  cancel(): void {
    this.setField(null);
  }

  private setField(field: FormlyFieldConfig): void {
    if (field !== this.field) {
      this.field = field || null;
      this.fieldGroup = field?.type === 'formly-group' || this.formlyDesignerConfig.types[field?.type]?.fieldGroup;
      this.fieldEdit.setValue(field ? cloneDeep(field) : {});
    }
  }
}
