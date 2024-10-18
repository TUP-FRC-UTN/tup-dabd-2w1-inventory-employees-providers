export class PostEmployeeDto{
// Asegúrate de tener la referencia correcta

  name: string|undefined;
  surname: string|undefined;
  documenValue: number|undefined;
  cuil: string|undefined;
  charge: number|undefined;
  contractStartTime?: Date|undefined;
  salary: number|undefined;
  license: boolean|undefined;
  mondayWorkday: boolean|undefined;
  tuesdayWorkday: boolean|undefined;
  wednesdayWorkday: boolean|undefined;
  thursdayWorkday: boolean|undefined;
  fridayWorkday: boolean|undefined;
  saturdayWorkday: boolean|undefined;
  sundayWorkday: boolean|undefined;
  startTime: string|undefined; 
  endTime: string|undefined;   
  supplierId?: number|undefined;
  emailValue: string|undefined;
  telephoneValue: number|undefined;
  userId: number|undefined;
  adressDto: AddressDto|undefined


}



export class AddressDto{
street: string|undefined;
number_street: number|undefined;
apartment: string|undefined;
floor: number|undefined;
postal_code: string|undefined;
city: string|undefined;
locality: string|undefined;
}


export class Charge{
id:number|undefined;
charge:string|undefined;
description:string|undefined;


}