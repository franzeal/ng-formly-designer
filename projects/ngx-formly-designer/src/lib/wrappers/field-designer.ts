import { Component, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { NEVER, Observable, timer } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DragDropService, FieldsService, FormlyDesignerService } from '../';
import { cloneDeep, isArray } from '../util';

@Component({
  selector: 'formly-designer-field-wrapper',
  template: `
    <div class="content" [title]="title"
      [ngClass]="{ 'drop-hint': isDragging$ | async, 'drop-target': dropTargetCounter > 0, hover: isHovering }"
      (dragenter)="onDragEnter($event)" (dragleave)="onDragLeave()" (dragover)="onDragOver($event)" (drop)="onDrop($event)"
      (mouseover)="onMouseOver($event)" (mouseout)="onMouseOut()">
      <ng-template #fieldComponent></ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      position: relative;
      justify-content: flex-start;
      align-content: flex-start;
      align-items: flex-start;
      margin: .25rem;
    }
    .content {
      border: 1px dashed #000;
      border-radius: 5px;
      min-height: 2rem;
      padding: 1.5em 1em 0 1em;
      width: 100%;
    }
    .content.hover {
      background-color: #f0f4c3;
      border-color: #00c853;
      cursor: pointer;
    }
    .content.drop-hint {
      background-color: #e3f2fd;
      border-color: #bbdefb;
    }
    .content.drop-target {
      background-color: #f0f4c3;
      border-color: #00c853;
    }
    .content:first-child {
      padding-top: 0;
    }
  `]
})
export class FormlyDesignerFieldWrapperComponent extends FieldWrapper implements OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true }) fieldComponent: ViewContainerRef;

  title: string = null;
  isDragging$: Observable<boolean>;
  isHovering = false;
  dropTargetCounter = 0;

  constructor(
    private dragDropService: DragDropService,
    private fieldsService: FieldsService,
    private formlyDesignerService: FormlyDesignerService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isDragging$ = this.dragDropService.dragging$.pipe(map(dragging => dragging != null));
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.formlyDesignerService.didClickField(this.field);
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
    if (typeof this.dragDropService.dragging === 'string') {
      event.preventDefault();
      if (isArray(this.field.fieldGroup)) {
        this.addFieldGroupChild(this.dragDropService.dragging);
      }
    }
  }

  onMouseOver(event: MouseEvent): void {
    event.stopPropagation();
    this.isHovering = true;
    this.title = this.dragDropService.dragging == null ?
      `Click to edit ${this.formlyDesignerService.getTypeName(this.field.type)}` :
      null;
  }

  onMouseOut(): void {
    this.isHovering = false;
  }

  private addFieldGroupChild(type: string): void {
    if (!isArray(this.field.fieldGroup)) {
      return;
    }
    const field = this.formlyDesignerService.createField(type);
    if (!this.fieldsService.checkField(field, this.formlyDesignerService.designerFields, this.field)) {
      return;
    }
    const updatedField = cloneDeep(this.field);
    updatedField.fieldGroup = [...updatedField.fieldGroup, field];
    timer()
      .pipe(
        tap(() => {
          this.formlyDesignerService.updateField(this.field, updatedField);
        }),
        catchError(() => NEVER)
      )
      .subscribe();
  }
}
