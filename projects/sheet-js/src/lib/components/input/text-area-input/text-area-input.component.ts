import { Component, OnInit, ElementRef } from '@angular/core';
import { TextInputComponent } from '../text-input/text-input.component';

@Component({
  selector: 'ct-text-area-input',
  templateUrl: './text-area-input.component.html'
})
export class TextAreaInputComponent extends TextInputComponent implements OnInit {

  constructor(component: ElementRef) {
    super(component);
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
    super.destroy();
  }

}
