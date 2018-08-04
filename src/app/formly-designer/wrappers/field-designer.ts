import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldWrapper } from '@ngx-formly/core';
import { FieldsService } from '../fields.service';
import { FormlyDesignerConfig } from '../formly-designer-config';
import { FormlyDesignerService } from '../formly-designer.service';
import * as $ from 'jquery';
import { Observable, timer } from 'rxjs';
import { cloneDeep } from '../../../utils';


@Component({
    selector: 'formly-wrapper-field-designer',
    template: `
        <div *ngIf="!editing" class="bg-info text-white control-panel">
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
            <button class="btn" type="button" [disabled]="disabled" (click)="edit()">
                <i class="fa fa-pencil" aria-hidden="true" title="edit"></i>
            </button>
            <button class="btn" type="button" [disabled]="disabled" (click)="remove()">
                <i class="fa fa-times" aria-hidden="true" title="remove"></i>
            </button>
        </div>
        <div class="content">
            <div class="editor" [hidden]="!editing">
                <field-editor #editor [hasContent]="true" [showType]="true" [showWrappers]="true" [formControl]="fieldEdit">
                    <div class="footer">
                        <button (click)="cancel()" class="btn btn-secondary mr-1">Cancel</button>
                        <button [disabled]="editor.invalid" (click)="accept()" class="btn btn-primary">Apply</button>
                    </div>
                </field-editor>
            </div>
            <div [hidden]="editing">
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
            min-height: 2em;
            padding: 1.5em 1em 0 1em;
            width: 100%;
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
export class FormlyWrapperFieldDesignerComponent extends FieldWrapper
    implements AfterContentInit, AfterContentChecked, OnInit {
    @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

    editing = false;
    fieldEdit = new FormControl({});
    fieldWrappers = new Array<string>();
    wrappers = new Array<string>();
    type: string;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private designerConfig: FormlyDesignerConfig,
        private elementRef: ElementRef,
        private fieldsService: FieldsService,
        private formlyDesignerService: FormlyDesignerService
    ) {
        super();
    }

    ngOnInit(): void {
        this.type = this.field.type;
        this.wrappers = Object.getOwnPropertyNames(this.designerConfig.wrappers);
        this.fieldWrappers = this.formlyDesignerService.getWrappers(this.formlyDesignerService.convertField(this.field)) || [];
    }

    ngAfterContentInit(): void {
        this.checkDesigner();
    }

    ngAfterContentChecked(): void {
        this.checkDesigner();
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
        this.fieldEdit.setValue(this.formlyDesignerService.convertField(cloneDeep(this.field)));
    }

    remove(): void {
        this.formlyDesignerService.removeField(this.field);
    }

    accept(): void {
        if (!this.fieldsService.checkField(this.fieldEdit.value, this.formlyDesignerService.fields)) {
            return;
        }
        Observable.create().pipe(timer()).subscribe(() => {
            this.formlyDesignerService.updateField(this.field, this.fieldEdit.value);
            this.formlyDesignerService.disabled = false;
            this.editing = false;
        });
    }

    cancel(): void {
        this.formlyDesignerService.disabled = false;
        this.editing = false;
    }

    private checkDesigner(): void {
        const element = $(this.elementRef.nativeElement);
        const designerEmpty = element.find('formly-wrapper-designer').length === 0;
        if (designerEmpty !== element.hasClass('designerEmpty')) {
            this.changeDetector.detectChanges();
            if (designerEmpty) {
                element.addClass('designerEmpty');
            }
            else {
                element.removeClass('designerEmpty');
            }
        }
    }
}
