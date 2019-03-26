import { ColumnDefinitionModel } from '../../models/column-definition.model';
import { DrawingService } from '../../services/drawing.service';
import { SheetDefinitionModel } from '../../models/sheet-definition.model';
import * as PIXI from 'pixi.js';
import { EventEmitter } from '@angular/core';
import { CellState } from '../../models/cell-state.model';
import { ArrowCanvasComponent } from './arrow.canvas-component';

export class CellCanvasComponent {

    protected state: CellState = CellState.none;

    protected model: any;

    protected drawing: DrawingService;

    protected currentContent: string = "";

    private text: PIXI.Text;

    private box: PIXI.Graphics;

    private arrow: ArrowCanvasComponent;

    private height: number;

    private width: number;

    public onPointerDown = new EventEmitter<CellCanvasComponent>();

    public onPointerUp = new EventEmitter<CellCanvasComponent>();

    public onEditing = new EventEmitter<CellCanvasComponent>();

    public onUnfold = new EventEmitter<CellCanvasComponent>();

    public onFold = new EventEmitter<CellCanvasComponent>();

    private isParent = false;

    private outlineLevel = 0;

    constructor(protected parent: PIXI.Container, protected sheetDefinition: SheetDefinitionModel, public definition: ColumnDefinitionModel) {
        this.drawing = new DrawingService();

        this.createComponent();
    }

    private createComponent() {
        const container = new PIXI.Container();

        container.interactive = true;
        container.interactiveChildren = true;

        const margin = 5;

        const dimension = { width: this.getWidth(), height: this.sheetDefinition.getDefaultLineHeight() };

        container.width = dimension.width;
        container.height = dimension.height;

        this.box = this.drawing.createBox({ x: 0, y: 0 }, dimension);
        this.text = this.drawing.createText({ x: 0 + margin, y: margin },
            { width: dimension.width - margin, height: dimension.height }, "");

        this.text.interactive = true;
        this.text.on('pointerdown', () => this.cellOnPointerDown());
        this.text.on('pointerup', () => this.cellOnPointerUp());

        container.position.x = this.getLeft();
        container.position.y = 0;

        if (this.definition.hasOutline) {
            this.arrow = new ArrowCanvasComponent(container, 0, 3, false);
            this.arrow.onStateChange.subscribe(() => this.setFoldState(this.arrow.state));
        }

        container.addChild(this.box);
        container.addChild(this.text);

        this.parent.addChild(container);
        this.detectChanges();
    }

    public shouldAutoSize(): boolean {
        return this.definition.autoSize;
    }

    public getWidth(): number {
        return this.definition.width;
    }

    public getLeft(): number {
        return this.definition.x;
    }

    public setValue(value: any) {
        this.definition.setValue(this.model, value);
        this.detectChanges();
    }

    public getValue(): any {
        return this.definition.getValue(this.model);
    }

    public getFormattedValue(): any {
        return this.definition.getFormattedValue(this.model);
    }

    public getMarginLeft(): number {
        return 5 + this.getOutline() * 15;
    }

    public getOutline(): number {
        if (!this.definition.hasOutline)
            return 0;
        return this.sheetDefinition.getOutlineLevel(this.model);
    }

    public redrawBox() {
        const dimension = { width: this.width, height: this.height };

        this.text.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

        this.drawing.drawBox(this.box, dimension, null);

        this.text.position.x = this.getMarginLeft();
        this.text.style.wordWrapWidth = this.getWidth() - this.text.position.x;

        if (this.arrow) {
            this.arrow.setRenderable(this.sheetDefinition.getIsParent(this.model));

            this.text.hitArea = new PIXI.Rectangle(0, 0, this.width - this.getMarginLeft(), this.height);

            this.arrow.setState(this.sheetDefinition.isFoldedUp(this.model));
            this.arrow.setPosition(this.getMarginLeft() - 15, 5);
        }
    }

    public setModel(model: any) {
        this.model = model;

        const width = this.getWidth();
        const height = this.getHeight();

        if (this.width != width || this.height != height) {
            this.width = width;
            this.height = height;
            this.redrawBox();
        }
    }

    public setFoldState(state: boolean) {
        if (state) {
            this.onUnfold.emit(this);
            return;
        }

        this.onFold.emit(this);
        return;
    }

    private getHeight() {
        return this.sheetDefinition.getHeight(this.model);
    }

    public edit() {
        this.state = CellState.editing;
        this.redrawBox();
        this.onEditing.emit(this);
    }

    public select() {
        this.state = CellState.selected;
        this.redrawBox();
    }

    public blur() {
        this.state = CellState.none;
        this.redrawBox();
    }

    private cellOnPointerDown() {
        this.onPointerDown.emit(this);
    }

    private cellOnPointerUp() {
        this.onPointerUp.emit(this);
        this.edit();
    }

    detectChanges() {
        if (!this.model)
            return;

        let shouldRedrawBox = false;

        const content = this.getFormattedValue();

        const currentHeight = this.getHeight();
        const isParent = this.sheetDefinition.getIsParent(this.model);
        const outLineLevel = this.sheetDefinition.getOutlineLevel(this.model);

        if (this.isParent != isParent) {
            this.isParent = isParent;
            shouldRedrawBox = true;
        }

        if (this.outlineLevel != outLineLevel) {
            this.outlineLevel = outLineLevel;
            shouldRedrawBox = true;
        }

        if (content != this.currentContent) {
            this.currentContent = content;
            this.text.text = content;
        }

        if (currentHeight != this.height) {
            this.height = currentHeight;
            shouldRedrawBox = true;
        }

        if (shouldRedrawBox) {
            this.redrawBox();
        }
    }
}