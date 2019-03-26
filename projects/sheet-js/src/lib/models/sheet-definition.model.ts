
export class SheetDefinitionModel {

    public getDefaultLineHeight() {
        return 28;
    }

    public getDefaultLineNumberWidth() {
        return 50;
    }

    public isFoldedUp(model: any) {
        return model.isFoldedUp || false;
    }

    public setFoldedUp(model: any, isFoledUp: boolean) {
        model.isFoldedUp = isFoledUp;
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

    public getParentKey(model: any): any {
        return model.parentKey;
    }

    public getOrder(model: any): number {
        return model.order;
    }

    public getIsParent(model: any) {
        return model.isParent || false;
    }

    public setIsParent(model: any, isParent: boolean) {
        model.isParent = isParent;
    }

    public getOutlineLevel(model: any) {
        return model.outline;
    }

    public setOutlineLevel(model: any, level: number) {
        model.outline = level;
    }

}