import { Component, OnInit, ElementRef, ViewChild, HostListener, ViewContainerRef, ComponentRef, ComponentFactoryResolver, ReflectiveInjector, Input } from '@angular/core';
import * as PIXI from 'pixi.js';
import { DrawingService } from '../../services/drawing.service';
import { SheetCanvasComponent } from '../canvas/sheet.canvas-component';
import { Observable, Subscriber } from 'rxjs';
import { SheetDefinitionModel } from '../../models/sheet-definition.model';
import { ColumnDefinitionModel } from '../../models/column-definition.model';
import { CellCanvasComponent } from '../canvas/cell.canvas-component';
import { RowCanvasComponent } from '../canvas/row.canvas-component';
import { TextInputComponent } from '../input/text-input/text-input.component';
import { TextAreaInputComponent } from '../input/text-area-input/text-area-input.component';

@Component({
  selector: 'ct-sheet',
  templateUrl: './sheet.component.html',
})
export class SheetComponent implements OnInit {

  public static ScrollSize: number = 17;

  public app: PIXI.Application;

  @ViewChild('input', { read: ViewContainerRef })
  private input: ViewContainerRef;

  @ViewChild("container")
  public container: ElementRef;

  @ViewChild("scroll")
  public scroll: ElementRef;

  public contentWidth: number;

  public contentHeight: number;

  @Input()
  public width: number = 1200;

  @Input()
  public height: number = 700;

  protected sheetCanvas: SheetCanvasComponent;

  protected observable: Observable<any[]> = new Observable<any[]>((subcriber) => this.subscriber = subcriber);

  protected subscriber: Subscriber<any[]>;

  protected sheetDefinition: SheetDefinitionModel;

  protected columnDefinitions: ColumnDefinitionModel[];

  protected currentInput: TextInputComponent;

  protected lastScrollTop: number = 0;
  protected lastScrollLeft: number = 0;

  constructor(private componentFactory: ComponentFactoryResolver, public element: ElementRef, public drawing: DrawingService) {

  }

  containerOnScroll() {
    this.sheetCanvas.scroll(this.getScrollLeft(), this.getScrollTop(), this.height);

    if (this.currentInput) {
      this.currentInput.top -= this.lastScrollTop - this.getScrollTop();
      this.currentInput.left -= this.lastScrollLeft - this.getScrollLeft();

      if (this.currentInput.top < 28 || this.currentInput.left < 50)
        this.cancelEdit();
      else if (this.currentInput.top + this.currentInput.height > this.getScrollHeight())
        this.cancelEdit();
      else if (this.currentInput.left + this.currentInput.width > this.getScrollWidth())
        this.cancelEdit();
    }

    this.lastScrollTop = this.getScrollTop();
    this.lastScrollLeft = this.getScrollLeft();
  }


  getScrollWidth() {
    return this.scroll.nativeElement.offsetWidth;
  }

  getScrollHeight() {
    return this.scroll.nativeElement.offsetHeight;
  }

  getScrollLeft() {
    return -this.scroll.nativeElement.scrollLeft;
  }

  getScrollTop() {
    return -this.scroll.nativeElement.scrollTop;
  }

  ngOnInit() {
    this.sheetDefinition = new SheetDefinitionModel();
    this.columnDefinitions = [];

    this.loadSampleColumns();

    this.intializeApp();

    this.sheetCanvas = new SheetCanvasComponent(this.app, this.observable, this.app.stage, this.sheetDefinition, this.columnDefinitions);
    this.sheetCanvas.onCellEditing.subscribe((data) => this.cellOnEdit(data));
    this.sheetCanvas.onResize.subscribe((data) => {
      this.contentHeight = data.height;
      this.contentWidth = data.width;
    })

    this.app.stage.addChild(this.drawing.createLineNumberCell({ x: 0, y: 0 }, { width: 50, height: 28 }, null));

    this.observable.subscribe((data) => this.updateContent(data));

    this.loadSample();

    this.containerOnScroll();
  }

  loadSampleColumns() {
    this.columnDefinitions.push(new ColumnDefinitionModel(0, 50, "A", "A"));
    this.columnDefinitions.push(new ColumnDefinitionModel(50, 50, "B", "B"));
    this.columnDefinitions.push(new ColumnDefinitionModel(100, 300, "C", "C", true, true, TextAreaInputComponent));
    this.columnDefinitions.push(new ColumnDefinitionModel(400, 100, "D", "D"));
    this.columnDefinitions.push(new ColumnDefinitionModel(500, 100, "E", "E"));
    this.columnDefinitions.push(new ColumnDefinitionModel(600, 100, "F", "F"));
    this.columnDefinitions.push(new ColumnDefinitionModel(700, 100, "G", "G"));
    this.columnDefinitions.push(new ColumnDefinitionModel(800, 100, "H", "H"));
    this.columnDefinitions.push(new ColumnDefinitionModel(900, 100, "I", "I"));
    this.columnDefinitions.push(new ColumnDefinitionModel(1000, 100, "J", "J"));
  }

  loadSample() {
    var sample = [];
    for (var i = 0; i < 1000; i++) {
      sample.push({
        key: i,
        parentKey: (i % 4) == 0 ? null : i - 1,
        isParent: (i % 4) < 4,
        order: i + 1,
        A: 1 + i,
        B: 1 + i,
        C: 1 + i,
        D: 1 + i,
        E: 1 + i,
        F: 1 + i,
        G: 1 + i,
        H: 1 + i,
        I: 1 + i,
        J: 1 + i,
        K: 1 + i,
        outline: 1 + i % 4,
        height: 28 + (i % 10 == 0 ? 10 : 0)
      })
    }

    this.subscriber.next(sample);
  }

  updateContent(data: any[]) {
    this.contentWidth = this.columnDefinitions.map(x => x.width).reduce((a, b) => a + b);
    this.contentHeight = 28 + data.map(x => this.sheetDefinition.getHeight(x)).reduce((a, b) => a + b);

    this.sheetCanvas.setData(data);
  }

  intializeApp() {
    this.app = new PIXI.Application({ width: this.width - SheetComponent.ScrollSize, height: this.height - SheetComponent.ScrollSize, transparent: true });
    this.container.nativeElement.appendChild(this.app.view);

    this.app.stage.position.x = 1;
  }

  cellOnEdit(data: { row: RowCanvasComponent, cell: CellCanvasComponent }) {
    this.input.clear();

    if (this.currentInput) {
      this.currentInput.destroy();
      this.currentInput = null;
    }

    if (data != null) {
      const columnDefinition = data.cell.definition;
      const inputComponentType = columnDefinition.inputType || TextInputComponent;
      const component = this.createComponent<TextInputComponent>(this.input, inputComponentType);
      const input = component.instance;

      let top = data.row.getTop() + this.sheetDefinition.getDefaultLineHeight() + this.getScrollTop();
      let left = data.cell.getLeft() + this.sheetDefinition.getDefaultLineNumberWidth() + this.getScrollLeft();

      left += 1;

      input.top = top;
      input.left = left;
      input.width = data.cell.getWidth();
      input.height = data.row.getHeight();
      input.model = data.cell.getValue();
      input.outline = data.cell.getOutline();
      input.autoSize = data.cell.shouldAutoSize();
      input.modelChange.subscribe((value) => data.cell.setValue(value));
      input.sizeChange.subscribe((value) => data.row.setHeight(value.height));

      this.currentInput = input;

      this.input.clear();
      this.input.insert(component.hostView);

      if (top + data.row.getHeight() > this.scroll.nativeElement.offsetHeight) {
        this.scroll.nativeElement.scrollTop += data.row.getHeight();
      } else if (top < this.sheetDefinition.getDefaultLineHeight() + 8) {
        this.scroll.nativeElement.scrollTop -= data.row.getHeight();
      }

      if (left + data.cell.getWidth() > this.scroll.nativeElement.offsetWidth) {
        this.scroll.nativeElement.scrollLeft += data.cell.getWidth();
      } else if (left < this.sheetDefinition.getDefaultLineNumberWidth() + 9 + 1) {
        this.scroll.nativeElement.scrollLeft -= data.cell.getWidth();
      }

      input.focus();
    }
  }

  cancelEdit() {
    this.currentInput = null;
    this.input.clear();
  }

  @HostListener("document:keyup", ['$event'])
  documentOnKewUp(event: KeyboardEvent) {
    this.sheetCanvas.keyboardOnKeyUp(event);
  }

  @HostListener("document:keydown", ['$event'])
  documentOnKewDown(event: KeyboardEvent) {
    this.sheetCanvas.keyboardOnKeyDown(event);
  }

  private createComponent<T>(vCref: ViewContainerRef, type: any): ComponentRef<T> {
    let factory = this.componentFactory.resolveComponentFactory(type);

    // vCref is needed cause of that injector..
    let injector = ReflectiveInjector.fromResolvedProviders([], vCref.parentInjector);

    // create component without adding it directly to the DOM
    let comp = factory.create(injector) as ComponentRef<T>;

    return comp;
  }

}
