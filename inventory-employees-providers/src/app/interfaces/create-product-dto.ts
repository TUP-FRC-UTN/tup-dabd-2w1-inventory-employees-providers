export interface createProductDTO {
    name: string;
    reusable: boolean;
    min_amount_warning: number;
    amount: number;
    supplier_id: number;
    description: string;
    unit_price: number;
    category_id: number;
}
