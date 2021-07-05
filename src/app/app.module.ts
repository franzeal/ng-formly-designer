import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyTabsModule } from 'ngx-formly-tabs';

import { FormlyDesignerModule } from 'ngx-formly-designer';

import { config, fieldComponents } from './config';
import { designerConfig } from './designer-config';

import { AppComponent } from './app.component';
import { ExpanderComponent } from './components/expander.component';
import { FieldsService, FormlyDesignerService } from 'ngx-formly-designer';

@NgModule({
  declarations: [
    AppComponent,
    ExpanderComponent,

    fieldComponents
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    FormlyTabsModule,
    FormlyBootstrapModule,
    FormlyModule.forRoot(config),

    FormlyDesignerModule.forRoot(designerConfig)
  ],
  providers: [FormlyDesignerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
