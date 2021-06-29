import {
  AfterContentChecked, AfterContentInit, ChangeDetectorRef, Component, ElementRef,
  HostListener, NgZone, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core';
import { NEVER, timer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FieldsService } from '../fields.service';
import { FormlyDesignerConfig } from '../formly-designer-config';
import { FormlyDesignerService } from '../formly-designer.service';
import { cloneDeep, isArray } from '../util';

@Component({
  selector: 'formly-designer-field-group-wrapper',
  template: `
    <div *ngIf="false && !editing" class="bg-info text-white control-panel">
      <span class="type">{{ type }}</span>
      <div class="btn-group">
        <button type="button" class="btn" data-toggle="dropdown"
          aria-haspopup="true" aria-expanded="false" title="wrappers">
          <i class="fa fa-clone" aria-hidden="true"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right">
          <button class="dropdown-item" type="button" [disabled]="disabled" title="add wrapper"
            *ngFor="let wrapper of wrappers" (click)="addWrapper(wrapper)">
            {{ wrapper }}
          </button>
          <ng-container *ngIf="fieldWrappers.length">
            <div *ngIf="wrappers.length" class="dropdown-divider"></div>
            <button class="dropdown-item" type="button" [disabled]="disabled"
              *ngFor="let wrapper of fieldWrappers; let i=index" (click)="removeWrapper(i)">
              {{ wrapper }}&nbsp;&nbsp;<i class="fa fa-times" aria-hidden="true" title="remove wrapper"></i>
            </button>
          </ng-container>
        </div>
      </div>
      <button [disabled]="disabled" type="button" class="btn" (click)="edit()">
        <i class="fa fa-pencil" aria-hidden="true" title="edit"></i>
      </button>
      <button [disabled]="disabled" type="button" class="btn" (click)="remove()">
        <i class="fa fa-times" aria-hidden="true" title="remove"></i>
      </button>
    </div>
    <div class="content">
      <div [hidden]="!editing">
        <formly-designer-field-editor #editor [fieldGroup]="true" [hasContent]="true" [showWrappers]="true"
          [formControl]="fieldEdit">
          <div class="footer">
            <button (click)="cancel()" class="btn btn-secondary mr-1">Cancel</button>
            <button [disabled]="editor.invalid" (click)="accept()" class="btn btn-primary">Apply</button>
          </div>
        </formly-designer-field-editor>
      </div>
      <div [hidden]="editing">
        <div class="form-group">
          <label>child</label>
          <formly-designer-field-picker (selected)="onFieldSelected($event)"></formly-designer-field-picker>
        </div>
        <ng-template #fieldComponent></ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      position: relative;
      justify-content: flex-start;
      align-content: flex-start;
      align-items: flex-start;
      margin: .25em;
    }
    :host.designerEmpty {
      display:none;
    }
    .btn:not(:disabled), .dropdown-item:not(:disabled) {
      cursor: pointer;
    }
    .control-panel {
      font-size: .8em;
      position: absolute;
      padding: 0 0 0 .5em;
      border-radius: 0 5px 0 0;
      right: 0;
      top: 0;
    }
    .control-panel > * {
      padding-right: .5em;
    }
    .control-panel .btn {
      font-size: unset;
      background-color: unset;
      padding: 0 .5em 0 0;
      color: #fff;
    }
    .content {
      border: 1px dashed #000;
      border-radius: 5px;
      padding: 1em;
      width: 100%;
    }
    .footer {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class FormlyDesignerFieldGroupWrapperComponent extends FieldWrapper
  implements AfterContentInit, AfterContentChecked, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true }) fieldComponent: ViewContainerRef;

  type: string;
  editing = false;
  fieldEdit = new FormControl({});
  fieldWrappers: string[] = [];
  wrappers: string[] = [];

  constructor(
    private changeDetector: ChangeDetectorRef,
    private designerConfig: FormlyDesignerConfig,
    private elementRef: ElementRef,
    private fieldsService: FieldsService,
    private formlyDesignerService: FormlyDesignerService,
    private zone: NgZone
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.field.templateOptions.$fieldArray) {
      this.type = this.field.templateOptions.$fieldArray.type || 'fieldArray';
    } else if (this.field.type) {
      this.type = this.field.type;
    } else if (this.field.fieldGroup) {
      this.type = 'fieldGroup';
    }
    this.wrappers = Object.getOwnPropertyNames(this.designerConfig.wrappers);
    this.fieldWrappers = this.formlyDesignerService.createPrunedField(this.field).wrappers || [];
  }

  ngAfterContentInit(): void {
    this.zone.runOutsideAngular(() => setTimeout(() => this.checkDesigner()));
  }

  ngAfterContentChecked(): void {
    this.zone.runOutsideAngular(() => setTimeout(() => this.checkDesigner()));
  }

  @HostListener('click')
  onClick() {
    this.formlyDesignerService.didClickField(this.field);
  }

  get disabled(): boolean {
    return this.formlyDesignerService.disabled;
  }

  addWrapper(wrapper: string): void {
    const field = cloneDeep(this.field);
    if (field.wrappers) {
      field.wrappers.push(wrapper);
    } else {
      field.wrappers = [wrapper];
    }
    this.formlyDesignerService.updateField(this.field, field);
  }

  removeWrapper(index: number): void {
    const field = cloneDeep(this.field);
    this.fieldWrappers.splice(index, 1);
    field.wrappers = this.fieldWrappers;
    this.formlyDesignerService.updateField(this.field, field);
  }

  edit(): void {
    this.editing = true;
    this.formlyDesignerService.disabled = true;
    this.fieldEdit.setValue(this.formlyDesignerService.createPrunedField(cloneDeep(this.field)));
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
      this.formlyDesignerService.disabled = false;
      this.editing = false;
    });
  }

  cancel(): void {
    this.formlyDesignerService.disabled = false;
    this.editing = false;
  }

  onFieldSelected(field: FormlyFieldConfig): void {
    if (isArray(this.field.fieldGroup) &&
      !this.fieldsService.checkField(field, this.formlyDesignerService.designerFields, this.field)) {
      return;
    }

    const updatedField = cloneDeep(this.field);
    updatedField.fieldGroup = isArray(updatedField.fieldGroup) ? updatedField.fieldGroup.slice() : [];
    updatedField.fieldGroup.push(field);

    timer()
      .pipe(
        tap(() => this.formlyDesignerService.updateField(this.field, updatedField)),
        catchError(() => NEVER)
      )
      .subscribe();
  }

  private checkDesigner(): void {
    const element = this.elementRef.nativeElement as HTMLElement;
    if (element.parentNode == null) {
      return;
    }

    const designerEmpty = element.querySelector('formly-designer-wrapper') == null;
    if (designerEmpty !== element.classList.contains('designerEmpty')) {
      this.changeDetector.detectChanges();
      if (designerEmpty) {
        element.classList.add('designerEmpty');
      } else {
        element.classList.remove('designerEmpty');
      }
    }
  }
}
