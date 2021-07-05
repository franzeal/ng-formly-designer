import { CommonModule } from '@angular/common';
import { ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyForm, FormlyModule } from '@ngx-formly/core';
import 'jquery';
import { FieldEditorComponent } from './components/field-editor';
import { FieldPickerComponent } from './components/field-picker';
import { PropertiesComponent } from './components/properties';
import { TypeSelectComponent } from './components/type-select';
import { TypesComponent } from './components/types';
import { WrapperEditorComponent } from './components/wrapper-editor';
import { WrapperPickerComponent } from './components/wrapper-picker';
import { WrapperSelectComponent } from './components/wrapper-select';
import { WrappersPickerComponent } from './components/wrappers-picker';
import { Config, fieldComponents, wrapperComponents } from './config';
import { DragDropService } from './drag-drop.service';
import { DesignerExtension } from './extensions/designer';
import { FieldsService } from './fields.service';
import { DesignerConfigOption, FormlyDesignerConfig, FORMLY_DESIGNER_CONFIG_TOKEN } from './formly-designer-config';
import { FormlyDesignerComponent } from './formly-designer.component';
import { DecyclePipe } from './pipes/decycle';

@NgModule({
  declarations: [
    FieldEditorComponent,
    FieldPickerComponent,
    FormlyDesignerComponent,
    PropertiesComponent,
    TypesComponent,
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
    PropertiesComponent,
    TypesComponent,
    WrapperEditorComponent
  ],
  providers: [
    Config,
    DesignerExtension,
    DragDropService,
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
