export interface ProductXDetailDto {
    product_id: number;
    name: string;
    discontinued: boolean;
    reusable: boolean;
    min_amount_warning: number;
    category: string;
    detail: string;
    state: string;
    unit_price: number;
    supplier_id: number;
}
