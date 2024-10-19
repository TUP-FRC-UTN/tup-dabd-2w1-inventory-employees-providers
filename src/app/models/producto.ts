export interface Producto {
  id: number;
  product: string;
  modificationType: string;
  date: string; // Cambiado de Date a string
  supplier: string;
  amount: number;
  description: string;
}

export interface ProductoResponse {
  productos: Producto[];
}