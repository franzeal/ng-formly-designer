import { FormlyFieldConfig } from '@ngx-formly/core';

export { cloneDeep, get, set, unset } from 'lodash-es';

const keyPathMemberName = '_formlyDesignerKeyPath';

// Source: https://github.com/formly-js/ngx-formly/blob/master/src/core/src/lib/utils.ts
export function getKeyPath(field: { key?: string | number | string[], fieldGroup?: any, fieldArray?: any }): (string | number)[] {
  /* We store the keyPath in the field for performance reasons. This function will be called frequently. */
  if (!(<any>field)[keyPathMemberName] || (<any>field)[keyPathMemberName].key !== field.key) {
    let keyPath: (string | number)[] = [];
    if (field.key) {
      /* Also allow for an array key, hence the type check  */
      const pathElements = isArray(field.key) ? field.key : field.key.toString().split('.');
      for (let pathElement of pathElements) {
        if (typeof pathElement === 'string') {
          /* replace paths of the form names[2] by names.2, cfr. angular formly */
          pathElement = pathElement.replace(/\[(\w+)\]/g, '.$1');
          keyPath = keyPath.concat(pathElement.split('.'));
        } else {
          keyPath.push(pathElement);
        }
      }
      for (let i = 0; i < keyPath.length; i++) {
        const pathElement = keyPath[i];
        if (typeof pathElement === 'string' && /^\d+$/.test(pathElement)) {
          keyPath[i] = parseInt(pathElement, 10);
        }
      }
    }
    (<any>field)[keyPathMemberName] = {
      key: field.key,
      path: keyPath,
    };
  }

  return (<any>field)[keyPathMemberName].path.slice();
}


export function equalType(a: FormlyFieldConfig, b: FormlyFieldConfig): boolean {
  return (!a.fieldArray === !b.fieldArray) && (!a.fieldGroup === !b.fieldGroup);
}

export const isArray = Array.isArray;

// https://stackoverflow.com/a/28953167
export const isEmpty = (val: any): boolean => {
  if (val === undefined)
    return true;

  else if (typeof (val) === 'function' || typeof (val) === 'number' || typeof (val) === 'boolean' ||
    Object.prototype.toString.call(val) === '[object Date]')
    return false;

  else if (val == null || val.length === 0)        // null or 0 length array
    return true;

  else if (typeof (val) === 'object') {
    // empty object

    let r;
    for (const _ in val)
      r = false;

    return r;
  }

  return false;
};

export const isFunction = (val: any): boolean => typeof val === 'function';

export const isObject = (val: any): boolean => typeof val === 'object' && val != null;

export const isString = (val: any): boolean => typeof val === 'string' || val instanceof String;

/** Source:  https://stackoverflow.com/a/8809472 */
export const generateUuid = () => {
  let d = new Date().getTime();
  let d2 = (performance?.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
};
