import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MONTHS, MONTHS_TH } from "../../constants/month";
import { useHouses } from "../../hooks/useHouses";
import { usePreviousBill } from "../../hooks/usePreviousBill";
import MonthYearPicker from "../../MonthYearPicker";
import { toBillingMonth } from "../../utils/billing-month";
import BillFormProvider, { useBillFormContext, type IBillForm } from "./BillFormProvider";

export default function BillForm(): ReactElement {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <BillFormProvider formRef={formRef}>
      <BillFormContent />
    </BillFormProvider>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </div>
  );
}

function BillFormContent() {
  const { register, setValue, watch } = useFormContext<IBillForm>();
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

  const waterRateUnit = selectedHouse?.water_unit_base || 0;
  const electricityRateUnit = selectedHouse?.electricity_unit_base || 0;

  const onSelectHouseUser = (id: string) => {
    const user = houseUsers?.find((house) => house.id === id);
    if (!user) return;
    setValue("rent", user.rent_base);
    setValue("internet", user.internet_base || 0);
    setValue("waterRateUnit", user.water_unit_base || 0);
    setValue("electricityRateUnit", user.electricity_unit_base || 0);
  };

  const onChangeBillingMonth = useCallback((value: string) => {
    if (!value) return;
    setBillingMonth(value);
    setValue("billingMonth", toBillingMonth(value));
  },[setValue]);

  const onChangeWaterUnit = (current: number) => {
    const useUnit = current - prevWaterUnit;
    let sum = 0;
    for (let i = 1; i <= useUnit; i++) {
      if (i <= 10) sum += 10.20;
      else if (i <= 20) sum += 16.00;
      else if (i <= 30) sum += 19.00;
      else if (i <= 50) sum += 21.20;
      else sum += 99999;
    }
    setValue("waterUsage", parseFloat(sum.toFixed(2)));
  };

  const onChangeElectricityUnit = (current: number) => {
    const useUnit = current - prevElectricityUnit;
    setValue("electricityUsage", useUnit * electricityRateUnit);
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
    setValue("prevWaterUnit", prevBill.waterUnit || 0);
    setValue("prevWaterUsage", prevBill.waterUsage || 0);
    setValue("prevElectricityUnit", prevBill.electricityUnit || 0);
    setValue("prevElectricityUsage", prevBill.electricityUsage || 0);
  }, [prevBill, setValue]);

  const populatedBillIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentBill) {
      populatedBillIdRef.current = null;
      return;
    }
    if (populatedBillIdRef.current === currentBill.id) return;
    populatedBillIdRef.current = currentBill.id;
    setValue("waterUnit", currentBill.waterUnit || 0);
    setValue("waterUsage", (currentBill.waterUsage || 0) * waterRateUnit);
    setValue("electricityUnit", currentBill.electricityUnit || 0);
    setValue("electricityUsage", (currentBill.electricityUsage || 0) * electricityRateUnit);
    setValue("rent", currentBill.rent || 0);
    setValue("internet", currentBill.internet || 0);
  }, [currentBill, waterRateUnit, electricityRateUnit, setValue]);

  const warningMonthName = useMemo(() => {
    if (!watchedBillingMonth) return "";
    const [year, month] = watchedBillingMonth.split("-");
    return `${MONTHS_TH[parseInt(month, 10) - 1]} ${year}`;
  }, [watchedBillingMonth]);

  const disabledInput =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-sm focus:outline-none transition-all";
  const activeInput =
    "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all";
  const calculatedInput =
    "w-full px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-sm font-medium focus:outline-none transition-all";
  const fieldLabel = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {t("bill.title")}
          </h1>
        </div>

        <div className="space-y-4">
          {/* House & Month */}
          <SectionCard title={t("bill.house")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="houseId" className={fieldLabel}>
                  {t("bill.house")}
                </label>
                <select
                  id="houseId"
                  className={`${activeInput} appearance-none cursor-pointer`}
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
              </div>
              <div>
                <label htmlFor="billingMonthPicker" className={fieldLabel}>
                  {t("bill.billingMonth")}
                </label>
                <MonthYearPicker setValue={onChangeBillingMonth} onChange={ (v)=>onChangeBillingMonth(v)} />
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
          <SectionCard title={t("bill.water")}>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
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
                    value={prevWaterUsage * waterRateUnit}
                    readOnly
                    className={disabledInput}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="waterUnit" className={fieldLabel}>{t("bill.currentUnit")}</label>
                  <input
                    id="waterUnit"
                    type="number"
                    step="any"
                    placeholder={t("bill.unitPlaceholder")}
                    className={activeInput}
                    {...register("waterUnit", {
                      valueAsNumber: true,
                      onChange: (e) => onChangeWaterUnit(Number(e.target.value)),
                    })}
                  />
                </div>
                <div>
                  <label htmlFor="waterUnitDiff" className={fieldLabel}>{t("bill.currentUse")}</label>
                  <input
                    id="waterUnitDiff"
                    type="number"
                    readOnly
                    className={calculatedInput}
                    value={Math.max(0, (watch("waterUnit") || 0) - prevWaterUnit)}
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
          <SectionCard title={t("bill.electricity")}>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
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
                    value={prevElectricityUsage * electricityRateUnit}
                    readOnly
                    className={disabledInput}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="electricityUnit" className={fieldLabel}>{t("bill.currentUnit")}</label>
                  <input
                    id="electricityUnit"
                    type="number"
                    step="any"
                    placeholder={t("bill.unitPlaceholder")}
                    className={activeInput}
                    {...register("electricityUnit", {
                      valueAsNumber: true,
                      onChange: (e) => onChangeElectricityUnit(Number(e.target.value)),
                    })}
                  />
                </div>
                <div>
                  <label htmlFor="electricityUnitDiff" className={fieldLabel}>{t("bill.currentUse")}</label>
                  <input
                    id="electricityUnitDiff"
                    type="number"
                    readOnly
                    className={calculatedInput}
                    value={Math.max(0, (watch("electricityUnit") || 0) - prevElectricityUnit)}
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
                  <p className="mt-1.5 text-xs text-slate-400">
                    {t("bill.perUnitRate", { rate: electricityRateUnit })}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Internet & Rent */}
          <SectionCard title={t("bill.internet")}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="internet" className={fieldLabel}>
                  {t("bill.internet")}
                </label>
                <input
                  id="internet"
                  type="number"
                  step="any"
                  placeholder={t("bill.enterAmount")}
                  className={activeInput}
                  {...register("internet", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label htmlFor="rent" className={fieldLabel}>
                  {t("bill.rent")}
                </label>
                <input
                  id="rent"
                  type="number"
                  step="any"
                  placeholder={t("bill.enterAmount")}
                  className={activeInput}
                  {...register("rent", { valueAsNumber: true })}
                />
              </div>
            </div>
          </SectionCard>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 btn-primary text-white font-semibold text-base rounded-2xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            {t("bill.generateBill")}
          </button>
        </div>

        <div className="text-center mt-6 text-white/20 text-xs tracking-widest font-mono">
          COPYRIGHT © 2026 - PROUD CH
        </div>
      </div>
    </div>
  );
}
