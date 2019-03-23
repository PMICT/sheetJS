
export class ColumnDefinitionModel {

    constructor(public x: number, public width: number, public property: string, public title: string, public hasOutline: boolean = false, public autoSize: boolean = false) {

    }

    public getOutlineLevel(model: any) {
        return model.outline;
    }

    public setValue(model: any, value: any): any {
        model[this.property] = value;
    }

    public getValue(model: any): any {
        if (model[this.property] == null)
            return "";

        return model[this.property];
    }

    public getFormattedValue(model: any): string {
        if (model[this.property] == null)
            return "";

        return model[this.property];
    }

}