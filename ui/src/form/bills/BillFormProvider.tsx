import { yupResolver } from "@hookform/resolvers/yup";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import {
  FormProvider,
  useForm,
  useWatch,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";
import * as yup from "yup";
import type { ObjectSchema } from "yup";
import { MONTHS_TH } from "../../constants/month";
import type { IReceiptData } from "../../interface/recipe";
import { generateBillPDF } from "../../utils/pdf";
import { useHouses } from "../../hooks/useHouses";
import { useAddBill } from "../../hooks/useAddBill";
import { useCurrentBill } from "../../hooks/useCurrentBill";
import { roundToMaxTwoDecimals } from "../../utils/number";
import { BillFormContext, PdfStatus } from "./BillFormContext";

type BillFormProviderProps = {
  children: React.ReactNode | React.ReactNode[];
  formRef: React.RefObject<HTMLFormElement | null>;
};

export default function BillFormProvider(
  props: BillFormProviderProps,
): ReactElement {
  const { children, formRef } = props;
  const { data: houseUsers } = useHouses();
  const { mutateAsync } = useAddBill();

  const defaultValues: IBillForm = useMemo(
    () => ({
      houseId: "",
      prevWaterUnit: 0,
      prevWaterUsage: 0,
      waterUnit: 0,
      waterUsage: 0,
      waterRateUnit: 0,
      prevElectricityUnit: 0,
      prevElectricityUsage: 0,
      electricityUnit: 0,
      electricityUsage: 0,
      electricityRateUnit: 0,
      internet: 0,
      rent: 0,
      billingMonth: new Date().toISOString().slice(0, 7),
    }),
    [],
  );

  const resolver = useMemo(
    () => yupResolver(BillFormSchema, { abortEarly: false }),
    [],
  );

  const formMethods = useForm<IBillForm>({
    criteriaMode: "all",
    defaultValues,
    mode: "onSubmit",
    resolver,
  });

  const { reset, handleSubmit, control } = formMethods;
  const [pdfStatus, setPdfStatus] = useState<PdfStatus>(PdfStatus.Idle);

  const watchedHouseId = useWatch({ control, name: "houseId" });
  const watchedBillingMonth = useWatch({ control, name: "billingMonth" });

  const { data: currentBill } = useCurrentBill({
    houseId: watchedHouseId || undefined,
    billingMonth: watchedBillingMonth || undefined,
  });

  const clearPdfStatus = useCallback(() => setPdfStatus(PdfStatus.Idle), []);

  const onReset = useCallback(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onSubmit: SubmitHandler<IBillForm> = async (data) => {
    const {
      houseId,
      prevWaterUnit,
      waterUnit,
      waterUsage,
      prevElectricityUnit,
      electricityUnit,
      electricityUsage,
      internet,
      billingMonth,
      rent,
      waterRateUnit,
      electricityRateUnit,
    } = data;
    const roundedPrevWaterUnit = roundToMaxTwoDecimals(prevWaterUnit);
    const roundedWaterUnit = roundToMaxTwoDecimals(waterUnit);
    const roundedWaterUsage = roundToMaxTwoDecimals(waterUsage);
    const roundedPrevElectricityUnit = roundToMaxTwoDecimals(prevElectricityUnit);
    const roundedElectricityUnit = roundToMaxTwoDecimals(electricityUnit);
    const roundedElectricityUsage = roundToMaxTwoDecimals(electricityUsage);
    const roundedInternet = roundToMaxTwoDecimals(internet);
    const roundedRent = roundToMaxTwoDecimals(rent);
    const roundedWaterRateUnit = roundToMaxTwoDecimals(waterRateUnit);
    const roundedElectricityRateUnit = roundToMaxTwoDecimals(electricityRateUnit);
    const roundedWaterUsageUnits = roundToMaxTwoDecimals(roundedWaterUnit - roundedPrevWaterUnit);
    const roundedElectricityUsageUnits = roundToMaxTwoDecimals(
      roundedElectricityUnit - roundedPrevElectricityUnit,
    );
    const roundedTotal = roundToMaxTwoDecimals(
      roundedWaterUsage + roundedElectricityUsage + roundedInternet + roundedRent,
    );
    try {
      console.log("submit bill form data:", data);
      if (!currentBill) {
        await mutateAsync({
          houseId,
          billingMonth,
          water: roundedWaterUsage,
          electricity: roundedElectricityUsage,
          waterUnit: roundedWaterUnit,
          electricityUnit: roundedElectricityUnit,
          waterUsageUnits: roundedWaterUsageUnits,
          electricityUsageUnits: roundedElectricityUsageUnits,
          internet: roundedInternet,
          rent: roundedRent,
        });
      }

      const [year, month] = billingMonth.split("-");

      const monthName = MONTHS_TH[parseInt(month, 10) - 1];

      const billData: IReceiptData = {
        houseNumber: houseUsers?.find((house) => house.id === houseId)?.name || "",
        month: `${monthName} ${year}`,
        year,
        items: [
          {
            name: "ค่าน้ำ",
            previous: roundedPrevWaterUnit,
            current: roundedWaterUnit,
            units: roundedWaterUsageUnits,
            price: roundedWaterRateUnit,
            amount: roundedWaterUsage,
          },
          {
            name: "ค่าไฟ",
            previous: roundedPrevElectricityUnit,
            current: roundedElectricityUnit,
            units: roundedElectricityUsageUnits,
            price: roundedElectricityRateUnit,
            amount: roundedElectricityUsage,
          },
        ],
        internet: roundedInternet,
        houseRent: roundedRent,
        total: roundedTotal,
      };
      setPdfStatus(PdfStatus.Loading);
      generateBillPDF(billData);
      setPdfStatus(PdfStatus.Success);
    } catch (e) {
      setPdfStatus(PdfStatus.Error);
      console.error("submit bill form error:", e);
    }
  };

  const onError: SubmitErrorHandler<IBillForm> = (errors) => {
    console.error("IBillForm:onError", errors);
  };

  useEffect(() => {
    reset(defaultValues, { keepDirty: true });
  }, [defaultValues, reset]);

  return (
    <BillFormContext.Provider value={{ currentBill, pdfStatus, clearPdfStatus }}>
      <FormProvider {...formMethods}>
        <form
          ref={formRef}
          id={"bill-form"}
          onReset={onReset}
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          {children}
        </form>
      </FormProvider>
    </BillFormContext.Provider>
  );
}

export interface IBillForm {
  houseId: string;
  prevWaterUnit: number;
  prevWaterUsage: number;
  waterUnit: number;
  waterUsage: number;
  waterRateUnit: number;
  prevElectricityUnit: number;
  prevElectricityUsage: number;
  electricityUnit: number;
  electricityUsage: number;
  electricityRateUnit: number;
  internet: number;
  rent: number;
  billingMonth: string;
}

const requiredNumber = (message: string) =>
  yup
    .number()
    .transform((v, o) => (o === "" || Number.isNaN(v) ? undefined : v))
    .required(message)
    .typeError(message);

export const BillFormSchema: ObjectSchema<IBillForm> = yup.object().shape({
  houseId: yup.string().required("validation.houseRequired"),
  prevWaterUnit: yup.number().required(),
  prevWaterUsage: yup.number().required(),
  waterUnit: requiredNumber("validation.currentUnitRequired"),
  waterUsage: yup.number().required(),
  waterRateUnit: requiredNumber("validation.invalid"),
  prevElectricityUnit: yup.number().required(),
  prevElectricityUsage: yup.number().required(),
  electricityUnit: requiredNumber("validation.currentUnitRequired"),
  electricityUsage: yup.number().required(),
  electricityRateUnit: requiredNumber("validation.invalid"),
  internet: requiredNumber("validation.internetInvalid"),
  rent: requiredNumber("validation.rentRequired"),
  billingMonth: yup.string().required(),
});
