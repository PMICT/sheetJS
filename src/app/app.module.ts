import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SheetJSModule } from 'projects/sheet-js/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SheetJSModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
