import { DrawingService } from '../../services/drawing.service';
import { CellCanvasComponent } from './cell.canvas-component';
import { ColumnDefinitionModel } from '../../models/column-definition.model';
import { SheetDefinitionModel } from '../../models/sheet-definition.model';
import { Observable } from 'rxjs';
import { RowCanvasComponent } from './row.canvas-component';
import { HashMap } from '../../models/hash-map.model';
import * as PIXI from 'pixi.js';
import { EventEmitter } from '@angular/core';

export class SheetCanvasComponent {

    protected headerContainer: PIXI.Container;

    protected lineNumbersContainer: PIXI.Container;

    protected dragAnchor: PIXI.Container;

    protected container: PIXI.Container;

    protected drawing: DrawingService;

    protected rowsData: any[] = [];

    protected sortedRows: RowCanvasComponent[];

    protected rows: HashMap<RowCanvasComponent> = {};

    protected currentRow: RowCanvasComponent;

    protected selectedRows: RowCanvasComponent[] = [];

    protected currentCell: CellCanvasComponent;

    protected overRow: RowCanvasComponent;

    protected isDragging = false;

    protected isMultiselecting = false;

    public onCellEditing = new EventEmitter<{ row: RowCanvasComponent, cell: CellCanvasComponent }>();

    constructor(protected app: PIXI.Application, protected observable: Observable<any[]>, 
        protected parent: PIXI.Container, protected sheetDefinition: SheetDefinitionModel, 
        protected columnDefinitions: ColumnDefinitionModel[]) {
        this.drawing = new DrawingService();

        this.createComponent();
        this.createDragAnchor();
        this.observable.subscribe((data) => this.setData(data));
    }

    private createDragAnchor() {
        this.dragAnchor = new PIXI.Container();
        this.dragAnchor.addChild(this.drawing.createBox({ x: 0, y: 0 }, { width: 2000, height: 1 }));
        this.dragAnchor.renderable = false;

        this.parent.addChild(this.dragAnchor);
    }

    private createComponent() {
        this.container = new PIXI.Container();
        this.lineNumbersContainer = new PIXI.Container();
        this.headerContainer = new PIXI.Container();

        this.parent.addChild(this.container);
        this.parent.addChild(this.headerContainer);
        this.parent.addChild(this.lineNumbersContainer);

        this.scroll(0, 0, 100);

        this.createHeader();
    }

    public setData(rowsData: any[]) {
        const deletedData = this.rowsData.filter(current =>
            rowsData.filter(newest => this.sheetDefinition.getKey(newest) == this.sheetDefinition.getKey(current)).length == 0);

        const insertedData = rowsData.filter(current =>
            this.rowsData.filter(newest => this.sheetDefinition.getKey(newest) == this.sheetDefinition.getKey(current)).length == 0);

        this.removeRows(deletedData);

        this.insertRows(insertedData);

        this.rowsData = rowsData;

        this.sortRows();
    }

    public detectChanges() {
        for (const key in this.rows) {
            const row = this.rows[key];
            row.detectChanges();
        }
    }

    scroll(x: number, y: number, height: number) {
        this.container.position.x = x + this.sheetDefinition.getDefaultLineNumberWidth() + 1;
        this.container.position.y = y + this.sheetDefinition.getDefaultLineHeight();
        this.headerContainer.position.y = 0;
        this.headerContainer.position.x = x;
        this.lineNumbersContainer.x = 1;
        this.lineNumbersContainer.y = y + this.sheetDefinition.getDefaultLineHeight();

        this.scrollY(y, height);
    }

    public sortRows(): RowCanvasComponent[] {
        let rows: RowCanvasComponent[] = [];

        for (const key in this.rows) {
            const row = this.rows[key];
            rows.push(row);
        }

        rows = rows.sort((a, b) => this.sheetDefinition.getOrder(a) - this.sheetDefinition.getOrder(b));

        let height = 0;

        for (const row of rows) {
            row.setTop(height);
            height += this.sheetDefinition.getHeight(row.getModel());
        }

        this.sortedRows = rows;

        return rows;
    }

    private removeRows(rowsData: any[]) {
        for (let data of rowsData) {
            const key = this.sheetDefinition.getKey(data);
            const currentRow = this.rows[key];

            if (currentRow) {
                currentRow.destroy();
                delete this.rows[key];
            }
        }
    }

    private insertRows(rowsData: any[]) {
        for (let data of rowsData) {
            const key = this.sheetDefinition.getKey(data);
            const currentRow = this.rows[key];

            if (!currentRow) {
                const row = new RowCanvasComponent(this.container, this.lineNumbersContainer, this.sheetDefinition, this.columnDefinitions);

                row.setRenderable(false);
                row.setModel(data);
                row.detectChanges();

                row.onPointerUp.subscribe((row) => this.rowOnPointerUp(row));
                row.onPointerDown.subscribe((row) => this.rowOnPointerDown(row));
                row.onPointerOver.subscribe((row) => this.rowOnOver(row));
                row.onCellEditing.subscribe(data => this.onCellEditing.emit(data));

                this.rows[key] = row;
            }
        }
    }

    private createHeader() {
        let left = this.sheetDefinition.getDefaultLineNumberWidth();

        for (var x = 1; x < this.columnDefinitions.length + 1; x++) {
            const position = { x: 1 + left, y: 0 };
            const column = this.columnDefinitions[x - 1];

            this.headerContainer.addChild(this.drawing.createHeaderCell(position, { width: column.width, height: this.sheetDefinition.getDefaultLineHeight() }, column.title));

            left += column.width;
        }
    }

    private rowOnOver(row: RowCanvasComponent) {
        this.overRow = row;

        const movingOntoSelection = this.selectedRows.indexOf(row) > -1;

        if (this.isDragging && !movingOntoSelection) {

            this.parent.cursor = "pointer";
            this.dragAnchor.renderable = true;

            if (this.overRow.getOrder() > this.currentRow.getOrder()) {
                this.dragAnchor.position.y = this.sheetDefinition.getDefaultLineHeight() + this.overRow.getTop() + this.overRow.getHeight();
            } else {
                this.dragAnchor.position.y = this.sheetDefinition.getDefaultLineHeight() + this.overRow.getTop();
            }

        } else {
            this.dragAnchor.renderable = false;
        }
    }

    private inversedSelection = false;

    private rowOnPointerUp(row: RowCanvasComponent) {
        this.isDragging = false;

        if (this.overRow == row) {
            this.dragAnchor.renderable = false;
        }

        if (this.currentCell)
            this.currentCell.blur();

        let anchorRow = this.selectedRows.sort((a, b) => a.getOrder() - b.getOrder())[0];
        if (this.inversedSelection)
            anchorRow = this.selectedRows.sort((a, b) => b.getOrder() - a.getOrder())[0];

        let minOrder = 0;
        let maxOrder = 0;

        if (!anchorRow)
            this.inversedSelection = false;
        else if (anchorRow.getOrder() <= row.getOrder())
            this.inversedSelection = false;
        else if (anchorRow.getOrder() >= row.getOrder())
            this.inversedSelection = true;

        if (!anchorRow || !this.isMultiselecting) {
            minOrder = row.getOrder();
            maxOrder = row.getOrder();
        } else if (!this.inversedSelection) {
            minOrder = anchorRow.getOrder();
            maxOrder = row.getOrder();
        } else {
            minOrder = row.getOrder();
            maxOrder = anchorRow.getOrder();
        }

        this.unselectAll();

        this.selectedRows = this.sortRows().filter(r => r.getOrder() >= minOrder && r.getOrder() <= maxOrder);

        this.currentRow = row;
        this.currentCell = row.selectedCell;

        for (let row of this.selectedRows)
            row.select();
    }

    private unselectAll() {
        if (this.currentCell)
            this.currentCell.blur();

        if (this.currentRow)
            this.currentRow.unselect();

        this.currentRow = null;
        this.currentCell = null;

        for (let row of this.selectedRows)
            row.unselect();

        this.onCellEditing.emit(null);
    }

    private rowOnPointerDown(row: RowCanvasComponent) {
        this.isDragging = true;
    }

    public keyboardOnKeyDown(event: KeyboardEvent) {
        this.isMultiselecting = event.shiftKey || event.ctrlKey;

        if (event.keyCode == 27) {
            this.unselectAll();
            event.preventDefault();
            return false;
        }
        else if (event.keyCode == 40 || event.keyCode == 13) {
            this.moveCursor(0, +1);
            event.preventDefault();
            return false;
        }
        else if (event.keyCode == 38) {
            this.moveCursor(0, -1);
            event.preventDefault();
            return false;
        }
        else if (event.shiftKey && event.keyCode == 9) {
            this.moveCursor(-1, 0);
            event.preventDefault();
            return false;
        }
        else if (!event.shiftKey && event.keyCode == 9) {
            this.moveCursor(+1, 0);
            event.preventDefault();
            return false;
        }
    }

    public keyboardOnKeyUp(event: KeyboardEvent) {
        this.isMultiselecting = event.shiftKey || event.ctrlKey;
        event.stopPropagation();
    }

    public moveCursor(x: number, y: number) {
        let currentRow = this.currentRow;
        let currentCell = this.currentCell;
        let currentCellIndex = currentRow && currentCell ? currentRow.getCellIndex(currentCell) : -1;

        this.unselectAll();

        let index = this.sortedRows.indexOf(currentRow);
        index += y;

        currentRow = this.sortedRows[index];

        if (currentRow) {
            currentRow.select();

            currentCellIndex += x;

            currentCell = currentRow.getCellByIndex(currentCellIndex);

            if (currentCell) {
                currentCell.edit();
            }
        }

        this.currentCell = currentCell;
        this.currentRow = currentRow;
    }

    private scrollY(y: number, viewHeight: number): void {

        const spaceBeforeView = - y - viewHeight;
        let heightOfLines = 0;

        if (!this.sortedRows) 
            return;

        for (let row of this.sortedRows) {
            heightOfLines += row.getHeight();

            if (heightOfLines < spaceBeforeView) {
                row.setRenderable(false);
            } else if (heightOfLines < y) {
                row.setRenderable(false);
            } else {
                row.setRenderable(true);
            }
        }
    }

}