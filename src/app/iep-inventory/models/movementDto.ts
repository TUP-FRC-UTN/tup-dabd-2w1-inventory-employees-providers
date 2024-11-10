export interface movementDto {
    movementType: string;
    productId: number ;
    unitPrice?: number ;
    date: Date;
    amount: number;
    supplierId?: number;
} 