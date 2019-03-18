import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SheetComponent } from './components/sheet/sheet.component';
import { DrawingService } from './services/drawing.service';
import { TextInputComponent } from './components/input/text-input/text-input.component';

@NgModule({
  declarations: [
    SheetComponent,
    TextInputComponent
  ],
  entryComponents: [
    TextInputComponent
  ],
  imports: [
    FormsModule
  ],
  providers: [
    DrawingService
  ],
  exports: [
    SheetComponent
  ]
})
export class SheetJSModule { }
