export enum MovementType {
  Agregacion = 'Agregacion',
  Disminucion = 'Disminucion'
}

export interface CreateMovementDTO {
  productId: number;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  createdUser?: number;
  price: number;
}

export interface MovementDTO {
  id: number;
  productId: number;
  productName: string;
  movementType: MovementType;
  quantity: number;
  movementDatetime: string; // Usar string para la fecha por simplicidad
  finalStock: number;
  reason?: string;
  unitprice: number;
}

export interface MovementFilterDTO {
  date?: string; // También usamos string para la fecha
  type?: MovementType;
}
