import { Injectable } from '@angular/core';
import { ConfigOption } from '@ngx-formly/core';
import { DesignerExtension } from './extensions/designer';
import {
  DESIGNER_WRAPPER_NAME,
  FIELD_DESIGNER_WRAPPER_NAME
} from './formly-designer-config';
import { FormlyDesignerWrapperComponent } from './wrappers/designer';
import { FormlyDesignerFieldWrapperComponent } from './wrappers/field-designer';
import { FormlyDesignerFieldGroupWrapperComponent } from './wrappers/field-group-designer';

export const fieldComponents = [];

export const wrapperComponents = [
  FormlyDesignerWrapperComponent,
  FormlyDesignerFieldWrapperComponent,
  FormlyDesignerFieldGroupWrapperComponent
];

@Injectable()
export class Config implements ConfigOption {
  wrappers: { name: string; component: any; }[];
  extensions: { name: string; extension: any; }[];
  constructor(
    designerExtension: DesignerExtension
  ) {
    this.wrappers = [
      { name: DESIGNER_WRAPPER_NAME, component: FormlyDesignerWrapperComponent },
      { name: FIELD_DESIGNER_WRAPPER_NAME, component: FormlyDesignerFieldWrapperComponent },
    ];
    this.extensions = [
      { name: 'designer', extension: designerExtension }
    ];
  }
}
