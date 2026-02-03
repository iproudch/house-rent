import axios from "axios";

type AddBillPayload = {
  houseId: string;
  billingMonth: string;
  electricity: number;
  water: number;
  rent: number;
  internet?: number;
};

export interface IBill {
  id: string;
  house_id: string;
  billingMonth: string;
  electricity: number;
  water: number;
  rent: number;
  internet?: number;
}

export const getPreviousBill = async (params: {
  houseId: string;
  billingMonth: string;
}): Promise<IBill | null> => {
  const res = await axios.get("/api/bills/prev-bill", {
    params,
  });

  return res.data;
};

export const addBill = async (payload: AddBillPayload): Promise<IBill> => {
  const { houseId, water, electricity, internet, rent, billingMonth } = payload;
  const total =
    Number(water) + Number(electricity) + Number(rent) + Number(internet || 0);

  const res = await axios.post(`/api/bills/${houseId}`, {
    water,
    electricity,
    rent,
    updateAt: new Date(),
    billing_month: new Date(billingMonth),
    total,
  });
  return res.data;
};
