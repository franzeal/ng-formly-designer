import { Injectable } from '@angular/core';
import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core';
import { DESIGNER_WRAPPER_NAME, FIELD_DESIGNER_WRAPPER_NAME } from '../formly-designer-config';

/** Creates a wrapper sandwich to augment the form */
@Injectable()
export class DesignerExtension implements FormlyExtension {
  postPopulate(field: FormlyFieldConfig) {
    // Only surround non-editor fields; assumes editor fields have no $designerId
    if (field?.templateOptions?.$designerId) {
      field.wrappers = [FIELD_DESIGNER_WRAPPER_NAME, ...(field.wrappers || []), DESIGNER_WRAPPER_NAME];
    }
  }
}
