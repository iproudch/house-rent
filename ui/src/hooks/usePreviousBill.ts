// hooks/usePreviousBill.ts
import { useQuery } from "@tanstack/react-query";
import { IBill } from "../../@types/bill";
import { getPreviousBill } from "../../../api/src/api/bills";

interface UsePreviousBillProps {
  houseId?: string;
  billingMonth?: string;
}

export const usePreviousBill = ({
  houseId,
  billingMonth,
}: UsePreviousBillProps) => {
  return useQuery<IBill | null>({
    queryKey: ["previous-bill", houseId, billingMonth],
    queryFn: () =>
      getPreviousBill({
        houseId: houseId!,
        billingMonth: billingMonth!,
      }),
    enabled: !!houseId && !!billingMonth,
  });
};
