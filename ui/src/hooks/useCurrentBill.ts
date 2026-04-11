import { useQuery } from "@tanstack/react-query";
import type { IBill } from "../../@types/bill";
import { getCurrentBill } from "../api/bills";

interface UseCurrentBillProps {
  houseId?: string;
  billingMonth?: string;
}

export const useCurrentBill = ({ houseId, billingMonth }: UseCurrentBillProps) => {
  return useQuery<IBill | null>({
    queryKey: ["current-bill", houseId, billingMonth],
    queryFn: () =>
      getCurrentBill({
        houseId: houseId as string,
        billingMonth: billingMonth as string,
      }),
    enabled: Boolean(houseId && billingMonth),
  });
};
