export class CreateProductDtoClass {
    name: string|undefined;
    reusable: boolean|undefined;
    min_amount_warning: number|undefined;
    amount: number|undefined;
    supplier_id: number|undefined;
    description: string|undefined;
    unit_price: number|undefined;
    category_id: number|undefined;
    state_id:number|undefined;

    /*constructor(name: string, reusable: boolean, min_amount_warning: number, 
        amount: number, supplier_id: number, description: string, unit_price:
         number, category_id: number) {
        this.name = name;
        this.reusable = reusable;
        this.min_amount_warning = min_amount_warning;
        this.amount = amount;
        this.supplier_id = supplier_id;
        this.description = description;
        this.unit_price = unit_price;
        this.category_id = category_id;
    }*/
    constructor() {
    }
}
