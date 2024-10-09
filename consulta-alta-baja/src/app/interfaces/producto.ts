// producto.interface.ts
export interface Producto {
    id: number;
    product: string;
    modificationType: string;
    date: Date ;
    supplier: string;
    amount: number;
    description: string;
  }
  
  export interface ProductoResponse {
    productos: Producto[];
  }
  