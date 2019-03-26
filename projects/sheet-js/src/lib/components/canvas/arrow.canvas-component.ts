import * as PIXI from 'pixi.js';
import { KeyboardArrowRight, KeyboardArrowDown } from './images';
import { EventEmitter } from '@angular/core';

export class ArrowCanvasComponent {

    public arrow: PIXI.Sprite;

    public container: PIXI.Container;

    public onStateChange = new EventEmitter<ArrowCanvasComponent>();

    protected checkedStateTexture: PIXI.Texture;

    protected uncheckedStateTexture: PIXI.Texture;

    constructor(protected parent: PIXI.Container, public x: number, public y: number, public state: boolean = false) {
        this.checkedStateTexture = PIXI.Texture.from(KeyboardArrowDown);
        this.uncheckedStateTexture = PIXI.Texture.from(KeyboardArrowRight);

        this.createComponent();
    }

    getImage(): PIXI.Texture {
        return this.state ? this.checkedStateTexture : this.uncheckedStateTexture;
    }

    createComponent() {
        this.container = new PIXI.Container();
        this.container.interactive = true;
        this.container.buttonMode = true;
        this.container.on("pointerup", () => this.click());

        this.arrow = PIXI.Sprite.from(this.getImage());
        this.arrow.buttonMode = true;
        this.arrow.interactive = true;

        this.arrow.width = 15;
        this.arrow.height = 15;

        this.container.addChild(this.arrow);

        this.parent.addChild(this.container);
    }

    setPosition(x: number, y: number) {
        this.container.hitArea = new PIXI.Rectangle(0, 0, 50, 50);
        this.container.position.x = x;
        this.container.position.y = y;
    }

    setState(value: boolean) {
        this.state = value;
        this.arrow.texture = this.getImage();
    }

    click() {
        this.state = !this.state;
        this.onStateChange.emit(this);

        this.arrow.texture = this.getImage();
    }

    setRenderable(renderable: boolean) {
        this.container.visible = renderable;
        this.container.renderable = renderable;
    }

}