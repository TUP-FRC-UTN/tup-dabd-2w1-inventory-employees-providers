export interface IepCreateWarehouseMovementDTO {
  responsible: string;
  id_movement_type: number;
  id_details: number[];
  applicant: string|undefined;
  date: string;
  reinstatement_datetime: Date;
  employee_id: number|undefined;
  
}



/*{
  "responsible": "Encargado de Inventario",
  "id_movement_type": 2,
  "id_details": [
   -60
  ],
  "applicant": "aaaaaaaaaaaaaaaaa",
  "date": "2025-10-21T22:37:51.220Z",
  "reinstatement_datetime": "2024-10-21T22:37:51.220Z",
  "employee_id": 2
}*/