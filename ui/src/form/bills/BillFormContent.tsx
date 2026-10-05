import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MONTHS, MONTHS_TH } from "../../constants/month";
import { useHouses } from "../../hooks/useHouses";
import { usePreviousBill } from "../../hooks/usePreviousBill";
import MonthYearPicker from "../../MonthYearPicker";
import { toBillingMonth } from "../../utils/billing-month";
import { roundToMaxTwoDecimals } from "../../utils/number";
import { calculateWaterBill } from "../../utils/water";
import { useBillFormContext } from "./BillFormContext";
import type { IBillForm } from "./BillFormProvider";
import SectionCard from "../../SectionCard";


type NumericBillField = Exclude<keyof IBillForm, "houseId" | "billingMonth">;

const resetHouseBillFields: NumericBillField[] = [
  "prevWaterUnit",
  "prevWaterUsage",
  "waterUnit",
  "waterUsage",
  "waterRateUnit",
  "prevElectricityUnit",
  "prevElectricityUsage",
  "electricityUnit",
  "electricityUsage",
  "electricityRateUnit",
  "internet",
  "rent",
];

function RequiredMark() {
  return (
    <span className="text-danger ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

function FieldError({ name, message }: { name: string; message?: string }) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <p id={`${name}-error`} role="alert" className="mt-1.5 text-[12.5px] font-medium text-danger-ink">
      {t(message)}
    </p>
  );
}

export default function BillFormContent() {
  const {
    register,
    setValue,
    watch,
    formState: { errors, submitCount },
  } = useFormContext<IBillForm>();
  const { t } = useTranslation();
  const { currentBill } = useBillFormContext();
  const now = new Date();
  const [billingMonth, setBillingMonth] = useState(
    `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
  );

  const houseId = watch("houseId");
  const watchedBillingMonth = watch("billingMonth");
  const prevWaterUnit = watch("prevWaterUnit") || 0;
  const prevElectricityUnit = watch("prevElectricityUnit") || 0;
  const prevWaterUsage = watch("prevWaterUsage") || 0;
  const prevElectricityUsage = watch("prevElectricityUsage") || 0;

  const { data: houseUsers } = useHouses();

  const selectedHouse = useMemo(
    () => houseUsers?.find((house) => house.id === houseId),
    [houseId, houseUsers],
  );

  const electricityRateUnit = selectedHouse?.electricity_unit_base || 0;

  const normalizeNumberField = (field: NumericBillField, value: string) => {
    setValue(field, roundToMaxTwoDecimals(Number(value)), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const normalizeWaterUnit = (value: string) => {
    if (value === "") return;
    const roundedValue = roundToMaxTwoDecimals(Number(value));
    setValue("waterUnit", roundedValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
    onChangeWaterUnit(roundedValue);
  };

  const normalizeElectricityUnit = (value: string) => {
    if (value === "") return;
    const roundedValue = roundToMaxTwoDecimals(Number(value));
    setValue("electricityUnit", roundedValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
    onChangeElectricityUnit(roundedValue);
  };

  const onSelectHouseUser = (id: string) => {
    resetHouseBillFields.forEach((field) => setValue(field, 0));
    setValue("waterUnit", NaN);
    setValue("electricityUnit", NaN);
    const user = houseUsers?.find((house) => house.id === id);
    if (!user) return;
    setValue("rent", roundToMaxTwoDecimals(user.rent_base));
    setValue("internet", roundToMaxTwoDecimals(user.internet_base || 0));
    setValue("waterRateUnit", roundToMaxTwoDecimals(user.water_unit_base || 0));
    setValue("electricityRateUnit", roundToMaxTwoDecimals(user.electricity_unit_base || 0));
  };

  const onChangeBillingMonth = useCallback((value: string) => {
    if (!value) return;
    setBillingMonth(value);
    setValue("billingMonth", toBillingMonth(value));
  },[setValue]);

  const onChangeWaterUnit = (current: number) => {
    const useUnit = roundToMaxTwoDecimals(current - prevWaterUnit);
    setValue("waterUsage", calculateWaterBill(useUnit));
  };

  const onChangeElectricityUnit = (current: number) => {
    const useUnit = current - prevElectricityUnit;
    setValue("electricityUsage", roundToMaxTwoDecimals(useUnit * electricityRateUnit));
  };

  const { data: prevBill } = usePreviousBill({
    houseId,
    billingMonth: toBillingMonth(billingMonth),
  });

  useEffect(() => {
    if (!prevBill) {
      setValue("prevWaterUnit", 0);
      setValue("prevWaterUsage", 0);
      setValue("prevElectricityUnit", 0);
      setValue("prevElectricityUsage", 0);
      return;
    }
    setValue("prevWaterUnit", roundToMaxTwoDecimals(prevBill.waterUnit || 0));
    setValue("prevWaterUsage", roundToMaxTwoDecimals(prevBill.waterUsage || 0));
    setValue("prevElectricityUnit", roundToMaxTwoDecimals(prevBill.electricityUnit || 0));
    setValue("prevElectricityUsage", roundToMaxTwoDecimals(prevBill.electricityUsage || 0));
  }, [prevBill, setValue]);

  const populatedBillIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentBill) {
      populatedBillIdRef.current = null;
      return;
    }
    if (populatedBillIdRef.current === currentBill.id) return;
    populatedBillIdRef.current = currentBill.id;
    setValue("waterUnit", currentBill.waterUnit ? roundToMaxTwoDecimals(currentBill.waterUnit) : NaN);
    setValue("waterUsage", calculateWaterBill(currentBill.waterUsage || 0));
    setValue("electricityUnit", currentBill.electricityUnit ? roundToMaxTwoDecimals(currentBill.electricityUnit) : NaN);
    setValue("electricityUsage", roundToMaxTwoDecimals((currentBill.electricityUsage || 0) * electricityRateUnit));
    setValue("rent", roundToMaxTwoDecimals(currentBill.rent || 0));
    setValue("internet", roundToMaxTwoDecimals(currentBill.internet || 0));
  }, [currentBill, electricityRateUnit, setValue]);

  const warningMonthName = useMemo(() => {
    if (!watchedBillingMonth) return "";
    const [year, month] = watchedBillingMonth.split("-");
    return `${MONTHS_TH[parseInt(month, 10) - 1]} ${year}`;
  }, [watchedBillingMonth]);

  const disabledInput =
    "w-full px-3.5 py-3 bg-surface-muted border border-line rounded-[10px] text-ink-soft text-[15px] focus:outline-none transition-all";
  const activeInput =
    "w-full px-3.5 py-3 bg-white border-[1.5px] border-line-strong rounded-[10px] text-ink text-[15px] placeholder-slate-300 focus:outline-none focus:border-primary transition-all";
  const calculatedInput =
    "w-full px-3.5 py-3 bg-primary-soft border border-primary-border rounded-[10px] text-primary-ink text-[15px] font-semibold focus:outline-none transition-all";
  const errorInput =
    "!border-danger !bg-danger-soft focus:!border-danger focus:ring-4 focus:ring-danger/10";
  const fieldLabel = "block text-[12.5px] text-muted mb-2";

  const inputClass = (name: keyof IBillForm, base = activeInput) =>
    errors[name] ? `${base} ${errorInput}` : base;
  const errorProps = (name: keyof IBillForm) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const errorCount = Object.keys(errors).length;

  return (
    <div className="max-w-[720px] w-full mx-auto px-6 pt-10 pb-10">
      <div>
        <div className="mb-7 fade-up">
          <h1 className="text-[26px] font-bold tracking-tight mb-1">{t("bill.title")}</h1>
          <p className="text-sm text-muted">{t("bill.subtitle")}</p>
        </div>

        <div className="space-y-5">
          {/* House & Month */}
          <SectionCard title={t("bill.house")} className="relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="houseId" className={fieldLabel}>
                  {t("bill.house")}
                  <RequiredMark />
                </label>
                <select
                  id="houseId"
                  {...errorProps("houseId")}
                  className={`${inputClass("houseId")} appearance-none cursor-pointer`}
                  {...register("houseId", {
                    onChange: (e) => onSelectHouseUser(e.target.value),
                  })}
                >
                  <option value="">{t("bill.selectHouse")}</option>
                  {houseUsers?.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.name}
                    </option>
                  ))}
                </select>
                <FieldError name="houseId" message={errors.houseId?.message} />
              </div>
              <div>
                <label htmlFor="billingMonthPicker" className={fieldLabel}>
                  {t("bill.billingMonth")}
                </label>
                <MonthYearPicker setValue={onChangeBillingMonth} onChange={() => onChangeBillingMonth(watchedBillingMonth)} />
              </div>
            </div>

            {currentBill && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                <span className="text-amber-500 text-base leading-none mt-0.5">⚠</span>
                <p className="text-sm text-amber-700 font-medium">
                  {t("bill.existingBillWarning", { month: warningMonthName })}
                </p>
              </div>
            )}
          </SectionCard>

          {/* Water Section */}
          <SectionCard
            title={t("bill.water")}
            badge={t("bill.waterAbbreviation")}
            badgeClass="bg-[oklch(0.93_0.04_230)] text-[oklch(0.4_0.1_230)]"
          >
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="prevWaterUnit" className={fieldLabel}>{t("bill.prevUnit")}</label>
                  <input
                    id="prevWaterUnit"
                    type="number"
                    disabled
                    className={disabledInput}
                    {...register("prevWaterUnit", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label htmlFor="prevWaterUsage" className={fieldLabel}>{t("bill.prevUse")}</label>
                  <input
                    id="prevWaterUsage"
                    type="number"
                    disabled
                    className={disabledInput}
                    {...register("prevWaterUsage", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label htmlFor="prevWaterAmount" className={fieldLabel}>{t("bill.prevAmount")}</label>
                  <input
                    id="prevWaterAmount"
                    type="number"
                    disabled
                    value={calculateWaterBill(prevWaterUsage)}
                    readOnly
                    className={disabledInput}
                  />
                </div>
              </div>
              <div className="h-px bg-line mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="waterUnit" className={fieldLabel}>
                    {t("bill.currentUnit")}
                    <RequiredMark />
                  </label>
                  <input
                    id="waterUnit"
                    type="number"
                    step="any"
                    placeholder={t("bill.unitPlaceholder")}
                    {...errorProps("waterUnit")}
                    className={inputClass("waterUnit")}
                    {...register("waterUnit", {
                      valueAsNumber: true,
                      onChange: (e) => onChangeWaterUnit(Number(e.target.value)),
                      onBlur: (e) => normalizeWaterUnit(e.target.value),
                    })}
                  />
                  <FieldError name="waterUnit" message={errors.waterUnit?.message} />
                </div>
                <div>
                  <label htmlFor="waterUnitDiff" className={fieldLabel}>{t("bill.currentUse")}</label>
                  <input
                    id="waterUnitDiff"
                    type="number"
                    readOnly
                    className={calculatedInput}
                    value={roundToMaxTwoDecimals(Math.max(0, (watch("waterUnit") || 0) - prevWaterUnit))}
                  />
                </div>
                <div>
                  <label htmlFor="waterUsage" className={fieldLabel}>{t("bill.currentAmount")}</label>
                  <input
                    id="waterUsage"
                    type="number"
                    readOnly
                    className={calculatedInput}
                    {...register("waterUsage", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Electricity Section */}
          <SectionCard
            title={t("bill.electricity")}
            badge={t("bill.electricAbbreviation")}
            badgeClass="bg-[oklch(0.93_0.05_90)] text-[oklch(0.45_0.13_90)]"
            aside={
              <span className="text-[13px] text-muted">
                {t("bill.rateLabel", { rate: electricityRateUnit })}
              </span>
            }
          >
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="prevElectricityUnit" className={fieldLabel}>{t("bill.prevUnit")}</label>
                  <input
                    id="prevElectricityUnit"
                    type="number"
                    disabled
                    className={disabledInput}
                    {...register("prevElectricityUnit", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label htmlFor="prevElectricityUsage" className={fieldLabel}>{t("bill.prevUse")}</label>
                  <input
                    id="prevElectricityUsage"
                    type="number"
                    disabled
                    className={disabledInput}
                    {...register("prevElectricityUsage", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label htmlFor="prevElectricityAmount" className={fieldLabel}>{t("bill.prevAmount")}</label>
                  <input
                    id="prevElectricityAmount"
                    type="number"
                    disabled
                    value={roundToMaxTwoDecimals(prevElectricityUsage * electricityRateUnit)}
                    readOnly
                    className={disabledInput}
                  />
                </div>
              </div>
              <div className="h-px bg-line mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="electricityUnit" className={fieldLabel}>
                    {t("bill.currentUnit")}
                    <RequiredMark />
                  </label>
                  <input
                    id="electricityUnit"
                    type="number"
                    step="any"
                    placeholder={t("bill.unitPlaceholder")}
                    {...errorProps("electricityUnit")}
                    className={inputClass("electricityUnit")}
                    {...register("electricityUnit", {
                      valueAsNumber: true,
                      onChange: (e) => onChangeElectricityUnit(Number(e.target.value)),
                      onBlur: (e) => normalizeElectricityUnit(e.target.value),
                    })}
                  />
                  <FieldError name="electricityUnit" message={errors.electricityUnit?.message} />
                </div>
                <div>
                  <label htmlFor="electricityUnitDiff" className={fieldLabel}>{t("bill.currentUse")}</label>
                  <input
                    id="electricityUnitDiff"
                    type="number"
                    readOnly
                    className={calculatedInput}
                    value={roundToMaxTwoDecimals(Math.max(0, (watch("electricityUnit") || 0) - prevElectricityUnit))}
                  />
                </div>
                <div>
                  <label htmlFor="electricityUsage" className={fieldLabel}>{t("bill.currentAmount")}</label>
                  <input
                    id="electricityUsage"
                    type="number"
                    readOnly
                    className={calculatedInput}
                    {...register("electricityUsage", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Internet & Rent */}
          <SectionCard
            title={t("bill.internetRent")}
            badge={t("bill.rentAbbreviation")}
            badgeClass="bg-[oklch(0.93_0.03_200)] text-[oklch(0.4_0.1_200)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="internet" className={fieldLabel}>
                  {t("bill.internet")}
                </label>
                <input
                  id="internet"
                  type="number"
                  step="any"
                  placeholder={t("bill.enterAmount")}
                  {...errorProps("internet")}
                  className={inputClass("internet")}
                  {...register("internet", {
                    valueAsNumber: true,
                    onBlur: (e) => normalizeNumberField("internet", e.target.value),
                  })}
                />
                <FieldError name="internet" message={errors.internet?.message} />
              </div>
              <div>
                <label htmlFor="rent" className={fieldLabel}>
                  {t("bill.rent")}
                  <RequiredMark />
                </label>
                <input
                  id="rent"
                  type="number"
                  step="any"
                  placeholder={t("bill.enterAmount")}
                  {...errorProps("rent")}
                  className={inputClass("rent")}
                  {...register("rent", {
                    valueAsNumber: true,
                    onBlur: (e) => normalizeNumberField("rent", e.target.value),
                  })}
                />
                <FieldError name="rent" message={errors.rent?.message} />
              </div>
            </div>
          </SectionCard>

          {submitCount > 0 && errorCount > 0 && (
            // key re-triggers the shake on every failed submit
            <div
              key={submitCount}
              role="alert"
              className="shake flex items-center gap-3 px-4 py-3.5 bg-danger-soft border border-danger-border rounded-xl"
            >
              <span className="w-[22px] h-[22px] shrink-0 rounded-full bg-danger text-white flex items-center justify-center text-xs font-bold">
                !
              </span>
              <p className="text-sm font-medium text-danger-ink">
                {t("validation.summary", { count: errorCount })}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 btn-primary text-white font-semibold text-base rounded-xl transition-colors cursor-pointer"
          >
            {t("bill.generateBill")}
          </button>
        </div>

        <div className="text-center mt-8 text-muted/60 text-xs tracking-widest font-mono">
          COPYRIGHT © 2026 - PROUD CH
        </div>
      </div>
    </div>
  );
}