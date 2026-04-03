import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, type ReactElement } from "react";
import {
  FormProvider,
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";
import * as yup from "yup";
import { ObjectSchema } from "yup";
import { useAddBill } from "../../hooks/useAddBill";
import { generateBillPDF } from "../../utils/pdf";
import type { IReceiptData } from "../../interface/recipe";
import { MONTHS } from "../../constants/month";

type BillFormProviderProps = {
  children: React.ReactNode | React.ReactNode[];
  formRef: React.RefObject<HTMLFormElement | null>;
};

export default function BillFormProvider(
  props: BillFormProviderProps,
): ReactElement {
  const { children, formRef } = props;
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

  const { reset, handleSubmit } = formMethods;

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
    try {
      // await mutateAsync({
      //   houseId,
      //   billingMonth,
      //   water: waterUsage,
      //   electricity: electricityUsage,
      //   waterUnit,
      //   electricityUnit,
      //   waterUsageUnits: waterUnit - prevWaterUnit,
      //   electricityUsageUnits: electricityUnit - prevElectricityUnit,
      //   internet,
      //   rent,
      // });

      const [year, month] = billingMonth.split("-");
  
      const monthName = MONTHS[parseInt(month, 10) - 1];

      const billData: IReceiptData = {
        houseNumber: houseId,
        month: `${monthName} ${year}`,
        year,
        items: [
          {
            name: "ค่าน้ำ",
            previous: prevWaterUnit,
            current: waterUnit,
            units: (waterUnit - prevWaterUnit),
            price: waterRateUnit,
            amount: waterUsage,
          },
          {
            name: "ค่าไฟ",
            previous: prevElectricityUnit,
            current: electricityUnit,
            units: (electricityUnit - prevElectricityUnit),
            price: electricityRateUnit,
            amount: electricityUsage,
          },
        ],
        internet: internet,
        houseRent: rent,
        total: (waterUsage + electricityUsage + internet + rent),
      };
      generateBillPDF(billData);
    } catch (e) {
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

export const BillFormSchema: ObjectSchema<IBillForm> = yup.object().shape({
  houseId: yup.string().required(),
  prevWaterUnit: yup.number().required(),
  prevWaterUsage: yup.number().required(),
  waterUnit: yup.number().required(),
  waterUsage: yup.number().required(),
  waterRateUnit: yup.number().required(),
  prevElectricityUnit: yup.number().required(),
  prevElectricityUsage: yup.number().required(),
  electricityUnit: yup.number().required(),
  electricityUsage: yup.number().required(),
  electricityRateUnit: yup.number().required(),
  internet: yup.number().required(),
  rent: yup.number().required(),
  billingMonth: yup.string().required(),
});
