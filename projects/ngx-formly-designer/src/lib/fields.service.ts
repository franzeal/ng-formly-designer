import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DesignerOption, FormlyDesignerConfig } from './formly-designer-config';
import { cloneDeep, equalType, generateUuid, getKeyPath, isArray, isString } from './util';

@Injectable()
export class FieldsService {
  constructor(
    private formlyDesignerConfig: FormlyDesignerConfig
  ) { }

  getFullKeyPath(field: FormlyFieldConfig, fields: FormlyFieldConfig[]): (string | number)[] {
    let keyPath = [];
    if (field && field.key) {
      const parents = new Map<FormlyFieldConfig, FormlyFieldConfig>();
      this.traverseFields(fields, (f, path, parent) => {
        parents.set(f, parent);
      });

      keyPath = getKeyPath(field);
      let cur = parents.get(field);
      while (cur) {
        keyPath = getKeyPath(cur).concat(keyPath);
        cur = parents.get(cur);
      }
    }
    return keyPath;
  }

  getTypeFields(type: string): FormlyFieldConfig[] {
    return this.getFields(type, 'type');
  }

  getWrapperFields(wrapper: string): FormlyFieldConfig[] {
    return this.getFields(wrapper, 'wrapper');
  }

  checkField(field: FormlyFieldConfig, fields: FormlyFieldConfig[], parent?: FormlyFieldConfig): boolean {
    if (field.key == null || (isString(field.key) && !field.key) || (isArray(field.key) && !field.key.length)) {
      return true;
    }
    const fullPathByField = new Map<FormlyFieldConfig, (string | number)[]>();
    const newPath = this.getFullKeyPath(parent || {}, fields).concat(getKeyPath(field));
    const length = newPath.length;
    return !this.traverseFields(fields, (f, p) => {
      const path = fullPathByField.get(f) || fullPathByField.set(f, (p || []).concat(getKeyPath(f))).get(f);
      if (path.length !== length) {
        return;
      }
      for (let i = 0; i < length; i++) {
        if (path[i] !== newPath[i]) {
          return;
        }
      }
      return !equalType(field, f);
    });
  }

  find(id: string, fields?: FormlyFieldConfig[]): FormlyFieldConfig {
    if (!id || !isArray(fields)) {
      return;
    }
    const stack = fields.slice();
    while (stack.length) {
      const field = stack.pop();
      if (field.templateOptions?.$designerId === id) {
        return field;
      }
      if (field.fieldArray) {
        stack.push(field.fieldArray);
      } else if (field.fieldGroup) {
        stack.push(...field.fieldGroup);
      }
    }
  }

  /** Find a field by full key path  */
  findField(field: FormlyFieldConfig, fields: FormlyFieldConfig[], parent?: FormlyFieldConfig): FormlyFieldConfig {
    if (!field || !fields) {
      return;
    }
    const fullPathByField = new Map<FormlyFieldConfig, (string | number)[]>();
    const newPath = this.getFullKeyPath(parent || {}, fields).concat(getKeyPath(field));
    const length = newPath.length;
    return this.traverseFields(fields, (f, p) => {
      const path = fullPathByField.get(f) || fullPathByField.set(f, (p || []).concat(getKeyPath(f))).get(f);
      if (path.length !== length) {
        return;
      }
      for (let i = 0; i < length; i++) {
        if (path[i] === newPath[i]) {
          return f;
        }
      }
    });
  }

  mutateField(field: FormlyFieldConfig, editorField: boolean): FormlyFieldConfig {
    field.templateOptions = { ...field.templateOptions };
    if (!editorField && !field.templateOptions.$designerId) {
      field.templateOptions.$designerId = generateUuid();
    }
    if (field.fieldGroup) {
      this.mutateFields(field.fieldGroup, editorField);
    } else if (field.fieldArray && field.fieldArray.fieldGroup) {
      if (editorField) {
        this.mutateField(field.fieldArray, editorField);
      } else {
        // Treating fieldArrays as fieldGroups
        field.templateOptions['$fieldArray'] = { type: field.type };
        field.fieldGroup = field.fieldArray.fieldGroup;
        delete field.fieldArray;
        delete field.type;

        this.mutateFields(field.fieldGroup, editorField);
      }
    }
    return field;
  }

  mutateFields(fields: FormlyFieldConfig[], editorFields: boolean): void {
    fields.forEach(field => this.mutateField(field, editorFields));
  }

  traverseFields(fields: FormlyFieldConfig[],
    callback: (field: FormlyFieldConfig, path?: (string | number)[], parent?: FormlyFieldConfig) => boolean | any,
    path?: (string | number)[],
    parent?: FormlyFieldConfig): boolean | any {
    path = path || [];
    for (const field of fields) {
      const value = callback(field, path, parent);
      if (value) {
        return value;
      }
      if (field.fieldArray) {
        const arrayValue = this.traverseFields([field.fieldArray], callback, path.concat(getKeyPath(field)), field);
        if (arrayValue) {
          return arrayValue;
        }
      } else if (field.fieldGroup) {
        const groupValue = this.traverseFields(field.fieldGroup, callback, path.concat(getKeyPath(field)), field);
        if (groupValue) {
          return groupValue;
        }
      }
    }
  }

  private getFields(name: string, type: string): FormlyFieldConfig[] {
    const designerOption = (name ? this.getDesignerOptions(type)[name] || {} : {}) as DesignerOption;
    const fields = cloneDeep(designerOption.fields || []);
    this.mutateFields(fields, true);
    return fields;
  }

  private getDesignerOptions(type: string): { [name: string]: DesignerOption } {
    if (type === 'type') {
      return this.formlyDesignerConfig.types;
    }
    if (type === 'wrapper') {
      return this.formlyDesignerConfig.wrappers;
    }
    return {};
  }
}
