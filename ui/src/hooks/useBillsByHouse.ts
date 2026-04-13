import { useQuery } from "@tanstack/react-query";
import { getBillsByHouse } from "../api/bills";

export const useBillsByHouse = (houseId: string | undefined) => {
  return useQuery({
    queryKey: ["bills", houseId],
    queryFn: () => getBillsByHouse(houseId!),
    enabled: !!houseId,
  });
};
