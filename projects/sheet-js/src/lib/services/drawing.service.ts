import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  constructor() {

  }

  public drawBox(graphic: PIXI.Graphics, dimension: { width: number, height: number }, backgroundColor: number = null,  
    lineSize: number = 1) {
    graphic.lineStyle(lineSize, 0xc0c0c0, 1);
    graphic.clear();

    if (backgroundColor != null) {
      graphic.beginFill(backgroundColor);
    }
    graphic.drawRect(0, 0, dimension.width, dimension.height);

    if (backgroundColor != null) {
      graphic.endFill();
    }
  }

  public createBox(position: { x: number, y: number },
    dimension: { width: number, height: number },
    backgroundColor: number = null): PIXI.Graphics {

    const graphic = new PIXI.Graphics();
    this.drawBox(graphic, dimension, backgroundColor);

    graphic.position.x = position.x;
    graphic.position.y = position.y;

    return graphic;
  }

  public createText(position: { x: number, y: number }, dimension: { width: number, height: number }, text: string): PIXI.Text {
    var style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0x0,
      stroke: '#4a1850',
      wordWrap: true,
      wordWrapWidth: dimension.width,
      align: 'left',
      breakWords: true,
    });

    var richText = new PIXI.Text(text, style);
    richText.x = position.x;
    richText.y = position.y + dimension.height / 2;
    richText.anchor.set(0, 0.5);

    return richText;
  }

  public createCell(position: { x: number, y: number }, dimension: { width: number, height: number }, text: string): PIXI.Container {
    const container = new PIXI.Container();
    const margin = 5;

    container.addChild(this.createBox({ x: 0, y: 0 }, dimension));
    container.addChild(this.createText({ x: 0 + margin, y: 0 },
      { width: dimension.width - margin, height: dimension.height }, text));

    container.position.x = position.x;
    container.position.y = position.y;

    return container;
  }

  public createLineNumberCell(position: { x: number, y: number }, dimension: { width: number, height: number }, number: number) {
    const container = new PIXI.Container();
    const margin = 5;

    container.addChild(this.createBox({ x: 0, y: 0 }, dimension, 0xf8f9fa));

    if (number != null) {
      container.addChild(this.createText({ x: 0 + margin, y: 0 },
        { width: dimension.width - margin, height: dimension.height }, number.toString()));
    }

    container.position.x = position.x;
    container.position.y = position.y;

    return container;
  }

  public createHeaderCell(position: { x: number, y: number }, dimension: { width: number, height: number }, text: string): PIXI.Container {
    const container = new PIXI.Container();
    const margin = 5;

    container.addChild(this.createBox({ x: 0, y: 0 }, dimension, 0xf8f9fa));
    container.addChild(this.createText({ x: 0 + margin, y: 0 },
      { width: dimension.width - margin, height: dimension.height }, text));

    container.position.x = position.x;
    container.position.y = position.y;

    return container;
  }

}
