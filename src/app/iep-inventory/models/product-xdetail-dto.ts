import { Details } from "./details";

export interface ProductXDetailDto {
    id: number;
    name: string;
    reusable: boolean;
    categoryId: number;
    minQuantityWarning: number;
    stock:number
    discontinued: boolean;
}
