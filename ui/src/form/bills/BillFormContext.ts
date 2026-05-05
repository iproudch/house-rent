import { createContext, useContext } from "react";
import type { IBill } from "../../../@types/bill";

type BillFormContextValue = {
  currentBill: IBill | null | undefined;
};

export const BillFormContext = createContext<BillFormContextValue>({
  currentBill: undefined,
});

export const useBillFormContext = () => useContext(BillFormContext);
