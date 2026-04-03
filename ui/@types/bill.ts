export interface IBill {
  id: string;
  houseId: string;
  billingMonth: string;
  electricityUnit: number;
  electricityUsage: number;
  waterUnit: number;
  waterUsage: number;
  rent: number;
  internet?: number;
}
