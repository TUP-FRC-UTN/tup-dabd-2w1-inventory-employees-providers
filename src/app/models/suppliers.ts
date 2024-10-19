export interface Supplier {
    id: number;
    name: string;
    healthInsurance: number;
    authorized: boolean;
    address: string;
    supplierTypeId: number | null;
    description: string | null;
  }
  