export type House = {
  id: string;
  name: string;
  rent_base: number;
  internet_base?: number;
  // add fields you actually have
};

export const fetchHouses = async (): Promise<House[]> => {
  const res = await fetch("/api/houses");

  if (!res.ok) {
    throw new Error("Failed to fetch houses");
  }

  return res.json();
};
