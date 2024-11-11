export interface ProductDTO {
    id?: number;
    name: string;
    description: string;
    currentStock: number;
    status: StatusProduct;
    categoryId: number;
    supplierId: number;
    minStock: number;
    reusable: boolean;
}

export interface CreateProductDTO {
    name: string;
    description: string;
    categoryId: number;
    supplierId: number;
    minStock: number;
    reusable: boolean;
    currentStock: number;
    createdUser?: number;
}

export interface UpdateProductDTO {
    name: string;
    description: string;
    minStock: number;
    lastUpdatedUser?: number;
}

export enum StatusProduct {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

// src/app/interfaces/category.interface.ts
export interface CategoryDTO {
    id: number;
    category: string;
    discontinued: boolean;
}

// src/app/interfaces/supplier.interface.ts
export enum SupplierType {
    REGULAR = 'REGULAR',
    PREMIUM = 'PREMIUM',
    // Agrega otros tipos según corresponda
}

export interface SupplierDTO {
    id: number;
    name: string;
    cuit: string;
    phoneNumber: string;
    address: string;
    supplierType: SupplierType;
    email: string;
    discontinued: boolean;
}
