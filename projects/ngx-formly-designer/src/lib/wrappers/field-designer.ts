import { Component, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DragDropService } from '../drag-drop.service';
import { FormlyDesignerService } from '../formly-designer.service';

@Component({
  selector: 'formly-designer-field-wrapper',
  template: `
    <div class="content" [ngClass]="{ 'drop-hint': isDragging$ | async, 'drop-target': dropTargetCounter > 0 }"
      (dragenter)="onDragEnter($event)" (dragleave)="onDragLeave()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
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
  `]
})
export class FormlyDesignerFieldWrapperComponent extends FieldWrapper implements OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true }) fieldComponent: ViewContainerRef;

  isDragging$: Observable<boolean>;
  dropTargetCounter = 0;

  constructor(
    private dragDropService: DragDropService,
    private formlyDesignerService: FormlyDesignerService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isDragging$ = this.dragDropService.dragging$.pipe(map(dragging => dragging != null));
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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    console.log(event);
  }
}
