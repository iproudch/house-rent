import axios from "axios";
import type { IBill } from "../../@types/bill";

type AddBillPayload = {
  houseId: string;
  billingMonth: string;
  water: number;
  electricity: number;
  waterUnit: number;
  electricityUnit: number;
  waterUsageUnits: number;
  electricityUsageUnits: number;
  rent: number;
  internet: number;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBill = (d: any): IBill => ({
  id: d.id,
  houseId: d.house_id,
  billingMonth: d.billing_month,
  electricityUnit: d.electricity_unit,
  electricityUsage: d.electricity_usage,
  waterUnit: d.water_unit,
  waterUsage: d.water_usage,
  rent: d.rent,
  internet: d.internet,
});

export const getPreviousBill = async (params: {
  houseId: string;
  billingMonth: string;
}): Promise<IBill | null> => {
  const res = await axios.get(`${API_URL}/api/bills/prev-bill`, { params });
  return res.data ? mapBill(res.data) : null;
};

export const addBill = async (payload: AddBillPayload): Promise<IBill> => {
  const {
    houseId,
    billingMonth,
    water,
    electricity,
    waterUnit,
    electricityUnit,
    waterUsageUnits,
    electricityUsageUnits,
    rent,
    internet,
  } = payload;

  const total = water + electricity + rent + internet;

  const res = await axios.post(`${API_URL}/api/bills/${houseId}`, {
    billing_month: billingMonth,
    water,
    electricity,
    water_unit: waterUnit,
    electricity_unit: electricityUnit,
    water_usage: waterUsageUnits,
    electricity_usage: electricityUsageUnits,
    rent,
    internet,
    total,
  });
  return mapBill(res.data);
};
