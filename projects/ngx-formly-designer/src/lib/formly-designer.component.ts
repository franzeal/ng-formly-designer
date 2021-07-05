import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { merge, NEVER, Observable, Subscription, timer } from 'rxjs';
import { catchError, debounceTime, map, tap } from 'rxjs/operators';
import { DragDropService } from './drag-drop.service';
import { FieldsService } from './fields.service';
import { FieldType, FormlyDesignerService } from './formly-designer.service';

@Component({
  selector: 'formly-designer',
  template: `
    <form novalidate [formGroup]="form">
      <formly-form *ngIf="fields.length > 0; else placeholder" [options]="options" [model]="model" [form]="form" [fields]="formlyDesignerService.designerFields$ | async">
      </formly-form>
      <ng-template #placeholder>
        <div class="content d-flex justify-content-center align-items-center"
          [ngClass]="{ 'drop-hint': isDragging$ | async, 'drop-target': dropTargetCounter > 0 }"
          (dragenter)="onDragEnter($event)" (dragleave)="onDragLeave()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
          <div>+</div>
        </div>
      </ng-template>
    </form>
    <!--<div>
      Designer Fields:
      <pre>{{ formlyDesignerService.designerFields$ | async | decycle | json }}</pre>
    </div>-->
  `,
  styles: [`
    formly-designer > form > .content {
      border: 1px dashed #000;
      border-radius: 5px;
      min-height: 2rem;
      padding: 1.5em 1em 0 1em;
      width: 100%;
    }
    formly-designer > form > .content.drop-hint {
      background-color: #e3f2fd;
      border-color: #bbdefb;
    }
    formly-designer > form > .content.drop-target {
      background-color: #f0f4c3;
      border-color: #00c853;
    }
    formly-designer > form > .content > div {
      padding: 2rem;
      padding-bottom: 4rem;
      font-size: 64pt;
      pointer-events: none;
    }
    formly-designer-field-picker .form-group > .input-group > formly-designer-type-select > select {
      border-radius: .25rem 0 0 .25rem;
      border-right: 0;
    }
    formly-designer-wrapper-editor .card > .card-body .form-control {
      width: 100%;
    }
    formly-designer-wrapper-picker .form-group > .input-group > formly-designer-wrapper-select > select {
      border-radius: .25rem 0 0 .25rem;
      border-right: 0;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class FormlyDesignerComponent implements OnDestroy, OnInit {
  @ViewChild('formlyFormContainer', { read: ViewContainerRef, static: true }) formlyFormContainer;
  @Output() fieldsChange = new EventEmitter<FormlyFieldConfig[]>();
  @Output() modelChange = new EventEmitter<any>();

  types: string[] = [];
  wrappers: string[] = [];
  properties: string[] = [];
  debugFields: FormlyFieldConfig[] = [];
  isDragging$: Observable<boolean>;
  dropTargetCounter = 0;

  form: FormGroup;
  options: any = {};

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private dragDropService: DragDropService,
    private fieldsService: FieldsService,
    private formBuilder: FormBuilder,
    public formlyDesignerService: FormlyDesignerService
  ) { }

  @Input()
  get disabled(): boolean {
    return this.formlyDesignerService.disabled;
  }

  set disabled(value: boolean) {
    this.formlyDesignerService.disabled = value;
  }

  @Input()
  get fields(): FormlyFieldConfig[] {
    return this.formlyDesignerService.fields;
  }

  set fields(value: FormlyFieldConfig[]) {
    this.formlyDesignerService.fields = value;
  }

  @Input()
  get model(): any {
    return this.formlyDesignerService.model;
  }

  set model(value: any) {
    this.formlyDesignerService.model = value;
  }

  ngOnInit(): void {
    // Editor forms will be restricted to a single field depth; all designer keys should be
    // complex (e.g. "templateOptions.some.property")
    this.form = this.formBuilder.group({});
    this.isDragging$ = this.dragDropService.dragging$.pipe(map(dragging => dragging != null));

    this.subscriptions.push(this.formlyDesignerService.designerFields$
      .subscribe(fields => {
        this.options = {};
        this.form = this.formBuilder.group({});
        this.fieldsChange.emit(this.formlyDesignerService.createPrunedFields(fields, FieldType.Plain));
      }));

    this.subscriptions.push(merge(
      this.formlyDesignerService.model$,
      this.form.valueChanges
    )
      .pipe(debounceTime(50))
      .subscribe(() => this.modelChange.emit(this.formlyDesignerService.model)));
  }

  ngOnDestroy(): void {
    this.subscriptions.splice(0).forEach(subscription => subscription.unsubscribe());
  }

  onFieldSelected(field: FormlyFieldConfig): void {
    timer().pipe(
      tap(() => {
        if (this.fieldsService.checkField(field, this.formlyDesignerService.designerFields)) {
          this.formlyDesignerService.addField(field);
        }
      }),
      catchError(() => NEVER)).subscribe();
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.dropTargetCounter++;
  }

  onDragLeave(): void {
    if (this.dropTargetCounter > 0) {
      this.dropTargetCounter--;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    if (this.fields.length) {
      return;
    }
    if (typeof this.dragDropService.dragging !== 'string') {
      return;
    }
    const field = this.formlyDesignerService.createField(this.dragDropService.dragging);
    this.formlyDesignerService.addField(field);
    event.preventDefault();
  }
}
