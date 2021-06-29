import { NgModule, ModuleWithProviders, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldEditorComponent } from './components/field-editor';
import { FieldPickerComponent } from './components/field-picker';
import { FieldsService } from './fields.service';
import { FormlyConfig, FormlyForm, FormlyModule } from '@ngx-formly/core';
import { FormlyDesignerComponent } from './formly-designer.component';
import { DesignerConfigOption, FormlyDesignerConfig, FORMLY_DESIGNER_CONFIG_TOKEN } from './formly-designer-config';
import { Config, fieldComponents, wrapperComponents } from './config';
import { DesignerExtension } from './extensions/designer';
import { TypeSelectComponent } from './components/type-select';
import { WrapperEditorComponent } from './components/wrapper-editor';
import { WrapperSelectComponent } from './components/wrapper-select';
import { WrapperPickerComponent } from './components/wrapper-picker';
import { WrappersPickerComponent } from './components/wrappers-picker';
import { DecyclePipe } from './pipes/decycle';
import 'jquery';

@NgModule({
  declarations: [
    FieldEditorComponent,
    FieldPickerComponent,
    FormlyDesignerComponent,
    TypeSelectComponent,
    WrapperEditorComponent,
    WrapperSelectComponent,
    WrapperPickerComponent,
    WrappersPickerComponent,

    DecyclePipe,

    fieldComponents,
    wrapperComponents
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    FormlyModule.forChild()
  ],
  exports: [
    FieldEditorComponent,
    FormlyDesignerComponent,
    WrapperEditorComponent
  ],
  providers: [
    Config,
    DesignerExtension,
    FormlyDesignerConfig,
    FieldsService
  ],
  entryComponents: [FormlyForm]
})
export class FormlyDesignerModule {
  constructor(
    config: Config,
    formlyConfig: FormlyConfig
  ) {
    formlyConfig.addConfig(config);
  }

  static forRoot(designerConfig: DesignerConfigOption = {}): ModuleWithProviders<FormlyDesignerModule> {
    return {
      ngModule: FormlyDesignerModule,
      providers: [
        { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: [fieldComponents, wrapperComponents], multi: true },
        { provide: FORMLY_DESIGNER_CONFIG_TOKEN, useValue: designerConfig, multi: true }
      ]
    };
  }
}
