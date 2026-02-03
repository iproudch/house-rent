export type House = {
  id: string;
  name: string;
  rent_base: number;
  internet_base?: number;
  water_unit_base?: number;
  electricity_unit_base?: number;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchHouses = async (): Promise<House[]> => {
  const res = await fetch(`${API_URL}/api/houses`);

  if (!res.ok) {
    throw new Error("Failed to fetch houses");
  }

  return res.json();
};
