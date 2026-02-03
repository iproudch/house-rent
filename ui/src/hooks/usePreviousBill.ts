// hooks/usePreviousBill.ts
import { useQuery } from "@tanstack/react-query";
import type { IBill } from "../../@types/bill";
import { getPreviousBill } from "../api/bills";

interface UsePreviousBillProps {
  houseId?: string;
  billingMonth?: string;
}

const fetchPreviousBill = ({
  houseId,
  billingMonth,
}: {
  houseId: string;
  billingMonth: string;
}): Promise<IBill | null> => {
  return getPreviousBill({ houseId, billingMonth }) as Promise<IBill | null>;
};

export const usePreviousBill = ({
  houseId,
  billingMonth,
}: UsePreviousBillProps) => {
  return useQuery<IBill | null>({
    queryKey: ["previous-bill", houseId, billingMonth],
    queryFn: () =>
      fetchPreviousBill({
        houseId: houseId as string,
        billingMonth: billingMonth as string,
      }),
    enabled: Boolean(houseId && billingMonth),
  });
};
