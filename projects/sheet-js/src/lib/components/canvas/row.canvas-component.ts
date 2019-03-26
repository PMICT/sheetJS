import { ColumnDefinitionModel } from '../../models/column-definition.model';
import { CellCanvasComponent } from './cell.canvas-component';
import { DrawingService } from '../../services/drawing.service';
import { SheetDefinitionModel } from '../../models/sheet-definition.model';
import * as PIXI from 'pixi.js';
import { RowState } from '../../models/row-state.model';
import { EventEmitter } from '@angular/core';
import { FontModel } from '../../models/font.model';
import { MoreVertical } from './images';

export class RowCanvasComponent {

    protected model: any;

    protected drawing: DrawingService;

    protected cells: CellCanvasComponent[] = [];

    protected container: PIXI.Container;

    protected menuContainer: PIXI.Container;

    protected background: PIXI.Graphics;

    protected y: number = 0;

    protected lineNumber: PIXI.Container;

    protected lineNumberBox: PIXI.Graphics;

    protected lineNumberText: PIXI.Text;

    protected currentHeight: number;

    protected rowState: RowState;

    public hidden = false;

    public onResize = new EventEmitter<RowCanvasComponent>();

    public onPointerUp = new EventEmitter<RowCanvasComponent>();

    public onPointerDown = new EventEmitter<RowCanvasComponent>();

    public onPointerOver = new EventEmitter<RowCanvasComponent>();

    public onPointerOut = new EventEmitter<RowCanvasComponent>();

    public onCellEditing = new EventEmitter<{ row: RowCanvasComponent, cell: CellCanvasComponent }>();

    public onFoldingChange = new EventEmitter<RowCanvasComponent>();

    public onMenuClick = new EventEmitter<RowCanvasComponent>();

    public selectedCell: CellCanvasComponent;

    constructor(protected parent: PIXI.Container, protected lineNumbersContainer: PIXI.Container, protected sheetDefinition: SheetDefinitionModel, protected columnDefinitions: ColumnDefinitionModel[]) {
        this.drawing = new DrawingService();
        this.rowState = RowState.none;
        this.createComponent();
    }

    protected createComponent() {
        const container = new PIXI.Container();
        container.interactive = true;

        this.background = new PIXI.Graphics();

        container.on('pointerover', () => this.rowOnPointerOver());
        container.on('pointerout', () => this.rowOnPointerOut());

        this.redrawBackground();

        container.addChild(this.background);

        this.columnDefinitions.forEach(definition => {
            const cell = new CellCanvasComponent(container, this.sheetDefinition, definition);

            cell.onFold.subscribe(cell => this.setFoldedUp(false));
            cell.onUnfold.subscribe(cell => this.setFoldedUp(true));
            cell.onPointerDown.subscribe(cell => this.cellOnPointerDown(cell));
            cell.onPointerUp.subscribe(cell => this.cellOnPointerUp(cell));
            cell.onEditing.subscribe(cell => this.cellOnEditing(cell));

            this.cells.push(cell);
        });

        container.position.x = 0;
        container.position.y = this.y;

        this.parent.addChild(container);

        this.container = container;

        this.createLineNumberComponent();
    }

    public createLineNumberComponent() {
        const container = new PIXI.Container();
        container.interactive = true;
        container.cursor = "move";

        const margin = 5;
        const textStyle = new FontModel();
        textStyle.align = "center";
        textStyle.verticalAlign = "middle";

        container.on('pointerover', () => this.rowOnPointerOver());
        container.on('pointerout', () => this.rowOnPointerOut());
        container.on('pointerup', () => this.lineNumberOnPointerUp());
        container.on('pointerdown', () => this.lineNumberOnPointerDown());

        const dimension = { width: this.sheetDefinition.getDefaultLineNumberWidth(), height: this.sheetDefinition.getDefaultLineHeight() };

        container.addChild(this.lineNumberBox = this.drawing.createBox({ x: 0, y: 0 }, dimension, 0xe6e6e6));

        container.addChild(this.lineNumberText = this.drawing.createText({ x: 0 + margin, y: 0 },
            { width: dimension.width, height: dimension.height }, null, textStyle));

        container.position.x = 0;
        container.position.y = 0;

        const menu = this.createMenu();
        menu.position.x = 5;
        menu.position.y = dimension.height / 2;
        menu.visible = false;

        container.addChild(menu);

        this.lineNumbersContainer.addChild(container);
        this.lineNumber = container;
        this.menuContainer = menu;
    }

    public createMenu(): PIXI.Container {
        const container = new PIXI.Container();
        container.interactive = true;
        container.buttonMode = true;

        const figure = PIXI.Sprite.from(MoreVertical);
        figure.anchor.set(0, 0.5);
        figure.width = 15;
        figure.height = 15;

        container.addChild(figure);
        container.hitArea = new PIXI.Rectangle(0, 0, 15, 15);
        container.on("pointerup", () => this.onMenuClick.emit(this));

        return container;
    }

    public redrawLineNumber() {
        const dimension = { width: this.sheetDefinition.getDefaultLineNumberWidth(), height: this.sheetDefinition.getHeight(this.model) };
        this.drawing.drawBox(this.lineNumberBox, dimension, 0xf8f9fa);
        this.lineNumberText.text = this.sheetDefinition.getOrder(this.model).toString();
    }

    public redrawBackground() {
        const width = this.columnDefinitions.map(x => x.width).reduce((a, b) => a + b);
        const height = this.getHeight();
        const isOver = (this.rowState & RowState.over) == RowState.over;
        const isSelected = (this.rowState & RowState.selected) == RowState.selected;

        const color = isOver ? 0xe6e6e6 : isSelected ? 0xe6e6e6 : 0xFFFFFF;

        this.background.clear();

        if (this.menuContainer)
            this.menuContainer.visible = isOver || isSelected;

        this.drawing.drawBox(this.background, { width: width, height: height }, color);
    }

    public setFoldedUp(value: boolean) {
        this.sheetDefinition.setFoldedUp(this.model, value);
        this.onFoldingChange.emit(this);
    }

    public setTop(top: number) {
        this.y = top;
        this.container.position.y = top;
        this.lineNumber.position.y = top;
    }

    public getOrder() {
        return this.sheetDefinition.getOrder(this.model);
    }

    public getTop() {
        return this.y;
    }

    public getHeight() {
        return this.sheetDefinition.getHeight(this.model);
    }

    public setHeight(height: number) {
        this.sheetDefinition.setHeight(this.model, height);
        this.detectChanges();
    }

    public getModel() {
        return this.model;
    }

    public setModel(model: any) {
        this.model = model;

        this.cells.forEach(cell => {
            cell.setModel(model);
        });
    }

    public detectChanges() {
        this.cells.forEach(cell => {
            cell.detectChanges();
        });

        const height = this.getHeight()

        if (this.currentHeight != height) {
            this.currentHeight = height;
            this.redrawLineNumber();
            this.redrawBackground();

            this.onResize.emit(this);
        }
    }

    public destroy() {
        this.container.destroy();
    }

    public select() {
        this.rowState = this.rowState | RowState.selected;
        this.redrawBackground();
    }

    public unselect() {
        this.rowState = this.rowState & (RowState.all - RowState.selected);
        this.redrawBackground();

        if (this.selectedCell)
            this.selectedCell.blur();
    }

    public rowOnPointerOut() {
        this.rowState = this.rowState & (RowState.all - RowState.over);
        this.redrawBackground();
        this.onPointerOut.emit(this);
    }

    public rowOnPointerOver() {
        this.rowState = this.rowState | RowState.over;
        this.redrawBackground();
        this.onPointerOver.emit(this);
    }

    private lineNumberOnPointerDown() {
        this.selectedCell = null;
        this.onPointerDown.emit(this);
        this.select();
    }

    private lineNumberOnPointerUp() {
        this.onPointerUp.emit(this);
    }

    private cellOnPointerDown(cell: CellCanvasComponent) {
        this.selectedCell = cell;
        this.onPointerDown.emit(this);
        this.select();
    }

    private cellOnPointerUp(cell: CellCanvasComponent) {
        this.onPointerUp.emit(this);
    }

    private cellOnEditing(cell: CellCanvasComponent) {
        this.onCellEditing.emit({ row: this, cell: cell });
    }

    public getCellIndex(cell: CellCanvasComponent): number {
        return this.cells.indexOf(cell);
    }

    public getCellByIndex(index: number): CellCanvasComponent {
        return this.cells[index];
    }

    public setRenderable(renderable: boolean) {
        this.lineNumber.visible = renderable;
        this.container.visible = renderable;
        this.lineNumber.renderable = renderable;
        this.container.renderable = renderable;
    }

}