import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyDesignerConfig } from '../formly-designer-config';
import { FormlyDesignerService } from '../formly-designer.service';
import { cloneDeep, isArray, isObject } from '../util';

@Component({
  selector: 'formly-designer-wrappers-picker',
  template: `
    <div class="form-group">
      <div class="input-group">
        <formly-designer-wrapper-picker [field]="field" (selected)="onWrapperSelected($event)">
        </formly-designer-wrapper-picker>
      </div>
      <div *ngFor="let wrapper of wrappers; let i = index" class="badge badge-default noselect" (click)="edit(i)">
        {{ wrapper }}&nbsp;&nbsp;<i class="fa fa-times" aria-hidden="true" (click)="remove(i)"></i>
      </div>
    </div>
    <div #modal class="modal fade" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit {{ wrapper }}</h5>
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
    `,
  styles: [`
    .badge {
      margin-right: .25em;
    }
    .badge {
      cursor: pointer;
    }
    .noselect {
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `]
})
export class WrappersPickerComponent implements OnChanges {
  @ViewChild('modal', { static: true }) modalRef: ElementRef;
  @Input() field: FormlyFieldConfig;
  @Output() selected = new EventEmitter<FormlyFieldConfig>();

  wrapper: string;
  fieldEdit = new FormControl({});

  wrappers: string[] = [];

  constructor(
    private formlyDesignerConfig: FormlyDesignerConfig,
    private formlyDesignerService: FormlyDesignerService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.field) {
      this.wrappers = this.formlyDesignerService.getWrappers(changes.field.currentValue);
    }
  }

  private get $modal(): JQuery & { modal: (command: string) => void } {
    return $(this.modalRef.nativeElement) as any;
  }

  onWrapperSelected(field: FormlyFieldConfig): void {
    this.selected.emit(field);
  }

  edit(index: number): void {
    this.wrapper = this.wrappers[index];
    if (isObject(this.field)) {
      const field = cloneDeep(this.field);
      if (isArray(field.wrappers)) {
        this.fieldEdit.setValue(field);

        const fields = this.formlyDesignerConfig.wrappers[this.wrapper].fields;
        if (isArray(fields) && fields.length > 0) {
          this.$modal.modal('show');
        } else {
          this.onApply();
        }
      }
    }
  }

  remove(index: number): void {
    const fieldWrappersIndex = this.field.wrappers.indexOf(this.wrappers[index]);
    if (fieldWrappersIndex < 0) {
      return;
    }

    const field = cloneDeep(this.field);
    field.wrappers.splice(fieldWrappersIndex, 1);
    this.field = this.formlyDesignerService.createPrunedField(field);
    this.selected.emit(this.field);
  }

  onApply(): void {
    this.field = this.formlyDesignerService.createPrunedField(this.fieldEdit.value);
    this.selected.emit(this.field);
    this.$modal.modal('hide');
  }
}
