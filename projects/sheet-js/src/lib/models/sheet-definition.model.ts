
export class SheetDefinitionModel {

    public getDefaultLineHeight() {
        return 28;
    }

    public getDefaultLineNumberWidth() {
        return 50;
    }

    public setHeight(model: any, height: number) {
        model.height = height;
    }

    public getHeight(model: any): number {
        if (model == null)
            return 28;
        return model.height;
    }

    public getKey(model: any): any {
        return model.key;
    }

    public getOrder(model: any): number {
        return model.order;
    }

}