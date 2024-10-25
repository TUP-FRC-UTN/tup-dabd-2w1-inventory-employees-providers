// employee-wake-up-call.interface.ts
export interface Employee {
    id: number;
    fullName: string;
    document: string;
    position: string;
    salary: number;
  }
  
  export interface WakeUpCall {
    employeeId: number;
    performanceType: string;
    startDate: Date;
    endDate: Date;
    observationsCount?: number;
  }
  
  export interface EmployeePerformance {
    employee: Employee;
    performance: WakeUpCall[];
  }
  