interface IReceiptItem {
  name: string;
  previous: string;
  current: string;
  units: string;
  price: string;
  amount: string;
}

export interface IReceiptData {
  houseNumber: string;
  month: string;
  year: string;
  items: IReceiptItem[];
  internet: string;
  houseRent: string;
  total: string;
}
