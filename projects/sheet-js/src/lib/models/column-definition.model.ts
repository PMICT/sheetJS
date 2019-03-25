import { Formatter } from '../components/formatters/formatter';
import { StringFormatter } from '../components/formatters/string.formatter';

export class ColumnDefinitionModel {

    constructor(public x: number, public width: number, public property: string, 
        public title: string, public hasOutline: boolean = false, 
        public autoSize: boolean = false, public inputType: any = null,
        public formatter: Formatter = new StringFormatter()) {
            
    }

    public getOutlineLevel(model: any) {
        return model.outline;
    }

    public setValue(model: any, value: any): any {
        model[this.property] = value;
    }

    public getValue(model: any): any {
        return model[this.property];
    }

    public setFormattedValue(model: any, value: string) {
        this.formatter.toModel(model, this.property, value);
    }

    public getFormattedValue(model: any): string {
        if (model[this.property] == null)
            return "";

        return this.formatter.toString(model, this.property);
    }

}