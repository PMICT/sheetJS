import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ComponentRef } from '@angular/core';

@Component({
  selector: 'lib-text-input',
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
    this.input.nativeElement.addEventListener("change", () => this.resize());
    this.input.nativeElement.addEventListener("cut", () => this.delayedResize());
    this.input.nativeElement.addEventListener("paste", () => this.delayedResize());
    this.input.nativeElement.addEventListener("drop", () => this.delayedResize());
    this.input.nativeElement.addEventListener("keydown", () => this.delayedResize());
  }

  focus() {
    this.input.nativeElement.focus();
  }

  private resize() {
    if (this.autoSize) {
      const height: number = Math.max(28, this.input.nativeElement.scrollHeight);

      this.input.nativeElement.style.height = 'auto';
      this.input.nativeElement.style.height = height + 'px';
      this.sizeChange.emit({ height: height });
    }
  }

  private delayedResize() {
    window.setTimeout(() => this.resize(), 0);
  }

  public destroy() {
    this.sizeChange.complete();
    this.modelChange.complete();
  }

}
