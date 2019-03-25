import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SheetComponent } from './components/sheet/sheet.component';
import { DrawingService } from './services/drawing.service';
import { TextInputComponent } from './components/input/text-input/text-input.component';
import { TextAreaInputComponent } from './components/input/text-area-input/text-area-input.component';

@NgModule({
  declarations: [
    SheetComponent,
    TextInputComponent,
    TextAreaInputComponent
  ],
  entryComponents: [
    TextInputComponent,
    TextAreaInputComponent
  ],
  imports: [
    FormsModule
  ],
  providers: [
    DrawingService
  ],
  exports: [
    SheetComponent,
    TextInputComponent,
    TextAreaInputComponent
  ]
})
export class SheetJSModule { }
