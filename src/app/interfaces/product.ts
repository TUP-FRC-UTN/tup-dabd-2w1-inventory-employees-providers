export interface Product {
    id: number;
    name: string;
    reusable: boolean;
    product_category_id: number;
    min_quantity_warning: number;
    created_datetime: Date;
    created_user: number;
    last_update_datetime: Date;
    last_updated_user: number;
    details: ProductDetails;
    state: ProductState;
    supplier: Supplier;
  }
  
  export interface ProductDetails {
    id: number;
    product_id: number;
    description: string;
    supplier_id: number;
    state_id: number;
    unit_price: number;
  }
  
  export interface ProductState {
    id: number;
    state: string;
    created_datetime: Date;
    created_user: number;
    last_update_datetime: Date;
    last_updated_user: number;
  }
  
  export interface Supplier {
    id: number;
    name: string;
    address: string;
    health_insurance: number;
    authorized: boolean;
    supplier_type_id: number;
    description: string;
    created_datetime: Date;
    created_user: number;
    last_update_datetime: Date;
    last_updated_user: number;
  }
  
  export interface ProductCategory {
    id: number;
    category: string;
    created_datetime: Date;
    created_user: number;
    last_update_datetime: Date;
    last_updated_user: number;
  }