// producto.interface.ts
export interface Producto {
    id: number;
    producto: string;
    tipoMovimiento: string;
    fecha: Date ;
    proveedor: string;
    cantidad: number;
    justificativo: string;
  }
  
  export interface ProductoResponse {
    productos: Producto[];
  }
  