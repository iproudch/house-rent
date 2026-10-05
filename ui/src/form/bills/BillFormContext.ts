import { createContext, useContext } from "react";
import type { IBill } from "../../../@types/bill";

export enum PdfStatus {
  Idle = "idle",
  Loading = "loading",
  Success = "success",
  Error = "error",
}

type BillFormContextValue = {
  currentBill: IBill | null | undefined;
  pdfStatus: PdfStatus;
  clearPdfStatus: () => void;
};

export const BillFormContext = createContext<BillFormContextValue>({
  currentBill: undefined,
  pdfStatus: PdfStatus.Idle,
  clearPdfStatus: () => {},
});

export const useBillFormContext = () => useContext(BillFormContext);
