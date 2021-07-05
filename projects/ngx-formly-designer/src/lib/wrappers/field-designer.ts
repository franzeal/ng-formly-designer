import { Component, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { DragDropService } from '../drag-drop.service';
import { FormlyDesignerService } from '../formly-designer.service';

@Component({
  selector: 'formly-designer-field-wrapper',
  template: `
    <div class="content" [ngClass]="{ 'drop-hint': (dragDropService.dragging$ | async) !== null, 'drop-target': dropTargetCounter > 0 }"
      (dragenter)="onDragEnter($event)" (dragleave)="onDragLeave()" (drop)="onDrop($event)">
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
      min-height: 2em;
      padding: 1.5em 1em 0 1em;
      width: 100%;
    }
    .content:hover {
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
    .editor {
      margin: 1em 0;
    }
    .footer {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class FormlyDesignerFieldWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true }) fieldComponent: ViewContainerRef;

  dropTargetCounter = 0;

  constructor(
    public dragDropService: DragDropService,
    private formlyDesignerService: FormlyDesignerService
  ) {
    super();
  }

  @HostListener('click')
  onClick(): void {
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

  onDrop(event: DragEvent): void {
    console.log(event);
  }

}
