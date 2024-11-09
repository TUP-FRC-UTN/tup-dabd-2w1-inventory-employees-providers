import { Details } from "./details";

export interface ProductXDetailDto {
    id: number;
    name: string;
    reusable: boolean;
    categoryId: number;
    minStock: number; // Cambiado de minQuantityWarning a minStock para coincidir con el nombre de la API
    currentStock: number;
    status: string;
    description: string; // Este campo es opcional si siempre está presente en la API
    price: number; // Eliminar `?` ya que está en la respuesta
    supplierId: number; // Eliminar `?` ya que está en la respuesta
}

