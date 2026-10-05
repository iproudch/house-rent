import { useTranslation } from "react-i18next";
import { useBillFormContext, PdfStatus } from "./form/bills/BillFormContext";

export default function PdfStatusModal() {
  const { t } = useTranslation();
  const { pdfStatus, clearPdfStatus } = useBillFormContext();

  if (pdfStatus === PdfStatus.Idle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 flex flex-col items-center gap-4">
        {pdfStatus === PdfStatus.Loading ? (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-primary-soft border-t-primary animate-spin" />
            <p className="text-slate-700 font-medium">{t("bill.generatingPDF")}</p>
          </>
        ) : pdfStatus === PdfStatus.Success ? (
          <>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-semibold text-lg">{t("bill.pdfSuccess")}</p>
              <p className="text-slate-400 text-sm mt-1">{t("bill.pdfSuccessDesc")}</p>
            </div>
            <button
              type="button"
              onClick={clearPdfStatus}
              className="w-full py-2.5 btn-primary text-white font-semibold rounded-xl cursor-pointer"
            >
              {t("bill.close")}
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-semibold text-lg">{t("bill.pdfError")}</p>
              <p className="text-slate-400 text-sm mt-1">{t("bill.pdfErrorDesc")}</p>
            </div>
            <button
              type="button"
              onClick={clearPdfStatus}
              className="w-full py-2.5 btn-primary text-white font-semibold rounded-xl cursor-pointer"
            >
              {t("bill.retry")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}