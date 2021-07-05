import { Component } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  fields: FormlyFieldConfig[] = [
    // { type: 'input', key: 'test1', templateOptions: { label: 'Test 1' } },
    // { type: 'input', key: 'test2', templateOptions: { label: 'Test 2' } },
    // { key: 'test3', fieldGroup: [] },
  ];
  model: any = {};
  fieldsResult: FormlyFieldConfig[] = [];
  modelResult: any;

  onFieldsChange(fields: FormlyFieldConfig[]): void {
    this.fieldsResult = fields;
  }

  onModelChange(model: any): void {
    this.modelResult = model;
  }
}
