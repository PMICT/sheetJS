import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ComponentRef } from '@angular/core';

@Component({
  selector: 'ct-text-input',
  templateUrl: './text-input.component.html'
})
export class TextInputComponent implements OnInit {

  _model: string;

  @ViewChild("input")
  input: ElementRef;

  @Input()
  get model(): string {
    return this._model;
  } set model(value: string) {
    if (this._model != value) {
      this._model = value;
      this.modelChange.emit(value);
    }
  }

  @Output()
  modelChange = new EventEmitter<string>();

  @Input()
  top: number;

  @Input()
  left: number;

  @Input()
  width: number;

  @Input()
  height: number;

  @Input()
  outline: number;

  @Input()
  autoSize: boolean = false;

  @Output()
  sizeChange = new EventEmitter<{ height: number }>();

  constructor(public component: ElementRef) {

  }

  ngOnInit() {
  }

  focus() {
    this.input.nativeElement.focus();
  }

  public destroy() {
    this.sizeChange.complete();
    this.modelChange.complete();
  }

}
