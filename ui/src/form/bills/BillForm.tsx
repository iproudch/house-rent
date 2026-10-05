import { useRef, type ReactElement } from "react";
import PdfStatusModal from "../../PdfStatusModal";
import BillFormContent from "./BillFormContent";
import BillFormProvider from "./BillFormProvider";

export default function BillForm(): ReactElement {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <BillFormProvider formRef={formRef}>
      <BillFormContent />
      <PdfStatusModal />
    </BillFormProvider>
  );
}

