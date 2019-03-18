import { Formatter } from './formatter';

export class StringFormatter extends Formatter {

    public toString(model: any, property: string): string {
        if (!model[property])
            return "";
        return model[property].toString();
    }

    public toModel(model: any, property: string, value: any) {
        model[property] = value;
    }

}