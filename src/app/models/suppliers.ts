export interface Supplier {
    id: number;
    name: string;
    healthInsurance: number;
    authorized: boolean;
    address: string;
    supplierType: string;
    description: string | null;
    email: string;
    phoneNumber: string
  }
  