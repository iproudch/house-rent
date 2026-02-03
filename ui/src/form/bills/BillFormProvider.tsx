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
// import { useAddBill } from "../../hooks/useAddBill";
import { generateBillPDF } from "../../utils/pdf";
import type { IReceiptData } from "../../interface/recipe";

type BillFormProviderProps = {
  children: React.ReactNode | React.ReactNode[];
  formRef: React.RefObject<HTMLFormElement | null>;
};

export default function BillFormProvider(
  props: BillFormProviderProps,
): ReactElement {
  const { children, formRef } = props;
  // const { mutate, isPending, error } = useAddBill();

  const defaultValues: IBillForm = useMemo(
    () => ({
      houseId: "",
      prevWaterUnit: 0,
      prevWaterUsage: 0,
      waterUnit: 0,
      waterUsage: 0,
      prevElectricityUnit: 0,
      prevElectricityUsage: 0,
      electricityUnit: 0,
      electricityUsage: 0,
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
    } = data;
    try {
      // mutate({
      //   houseId,
      //   water,
      //   internet,
      //   electricityUnit,
      //   electricityUsage,
      //   billingMonth,
      //   rent,
      // });
      const billData: IReceiptData = {
        houseNumber: houseId,
        month: billingMonth,
        year: billingMonth.slice(0, 4),
        items: [
          {
            name: "ค่าน้ำ",
            previous: prevWaterUnit.toString(),
            current: waterUnit.toString(),
            units: (waterUnit - prevWaterUnit).toString(),
            price: "6.00",
            amount: waterUsage.toString(),
          },
          {
            name: "ค่าไฟ",
            previous: prevElectricityUnit.toString(),
            current: electricityUnit.toString(),
            units: (electricityUnit - prevElectricityUnit).toString(),
            price: "10.00",
            amount: electricityUsage.toString(),
          },
        ],
        internet: internet.toString(),
        houseRent: rent.toString(),
        total: (waterUsage + electricityUsage + rent).toString(),
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
  prevElectricityUnit: number;
  prevElectricityUsage: number;
  electricityUnit: number;
  electricityUsage: number;
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
  prevElectricityUnit: yup.number().required(),
  prevElectricityUsage: yup.number().required(),
  electricityUnit: yup.number().required(),
  electricityUsage: yup.number().required(),
  internet: yup.number().required(),
  rent: yup.number().required(),
  billingMonth: yup.string().required(),
});
