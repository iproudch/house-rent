interface IReceiptItem {
  name: string;
  previous: number;
  current: number;
  units: number;
  price: number;
  amount: number;
    waterRateUnit?: number
  electricityRateUnit?: number
}

export interface IReceiptData {
  houseNumber: string;
  month: string;
  year: string;
  items: IReceiptItem[];
  internet: number;
  houseRent: number;
  total: number;

}
