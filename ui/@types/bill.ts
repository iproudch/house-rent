export interface IBill {
  id: string;
  house_id: string;
  billingMonth: string;
  electricity_unit: number;
  electricity_usage: number;
  water_unit: number;
  water_usage: number;
  rent: number;
  internet?: number;
}
