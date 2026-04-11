import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import BillFormProvider, { useBillFormContext, type IBillForm } from "./BillFormProvider";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHouses } from "../../hooks/useHouses";
import MonthYearPicker from "../../MonthYearPicker";
import { usePreviousBill } from "../../hooks/usePreviousBill";
import { toBillingMonth } from "../../utils/billing-month";
import { MONTHS, MONTHS_TH } from "../../constants/month";

export default function BillForm(): ReactElement {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <BillFormProvider formRef={formRef}>
      <BillFormContent />
    </BillFormProvider>
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

  const onChangeBillingMonth = (value: string) => {
    if (!value) return;
    setBillingMonth(value);
    setValue("billingMonth", toBillingMonth(value));
  };

  const onChangeWaterUnit = (current: number) => {
    const useUnit = current - prevWaterUnit;
    setValue("waterUsage", useUnit * waterRateUnit);
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

  useEffect(() => {
    if (!currentBill) return;
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
    "w-full px-4 py-3 bg-gray-100 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all duration-200";
  const activeInput =
    "w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200";
  const calculatedInput =
    "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all duration-200";

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-zinc-900 mb-2 tracking-tight">
            {t("bill.title")}
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm">
          <div className="space-y-6">
            <div className="flex flex-col items-start">
              <label
                htmlFor="houseId"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
                {t("bill.house")}
              </label>
              <select
                id="houseId"
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200 appearance-none cursor-pointer"
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

            <div className="flex flex-col items-start">
              <label
                htmlFor="billingMonth"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
                {t("bill.billingMonth")}
              </label>
              <MonthYearPicker
                setValue={onChangeBillingMonth}
                onChange={() => {}}
              />
            </div>

            {/* Existing bill warning */}
            {currentBill && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
                <p className="text-sm text-amber-800 font-medium">
                  มีใบแจ้งหนี้สำหรับเดือน{warningMonthName}แล้ว กดสร้างบิลเพื่อออกใบแจ้งหนี้อีกครั้ง
                </p>
              </div>
            )}

            {/* Water Section */}
            <div className="flex flex-col items-start">
              <label className="block text-sm font-medium text-zinc-900 mb-3">
                {t("bill.water")}
              </label>
              <div className="w-full space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.prevUnit")}
                    </label>
                    <input
                      type="number"
                      disabled
                      className={disabledInput}
                      {...register("prevWaterUnit", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.prevUse")}
                    </label>
                    <input
                      type="number"
                      disabled
                      className={disabledInput}
                      {...register("prevWaterUsage", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.prevAmount")}
                    </label>
                    <input
                      type="number"
                      disabled
                      value={prevWaterUsage * waterRateUnit}
                      readOnly
                      className={disabledInput}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.currentUnit")}
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder={t("bill.unitPlaceholder")}
                      className={activeInput}
                      {...register("waterUnit", {
                        valueAsNumber: true,
                        onChange: (e) =>
                          onChangeWaterUnit(Number(e.target.value)),
                      })}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.currentUse")}
                    </label>
                    <input
                      type="number"
                      placeholder={t("bill.unitPlaceholder")}
                      readOnly
                      className={calculatedInput}
                      value={
                        (watch("waterUnit") || 0) - prevWaterUnit
                      }
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.currentAmount")}
                    </label>
                    <input
                      type="number"
                      placeholder={t("bill.amountPlaceholder")}
                      readOnly
                      className={calculatedInput}
                      {...register("waterUsage", { valueAsNumber: true })}
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      {t("bill.perUnitRate", { rate: waterRateUnit })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Electricity Section */}
            <div className="flex flex-col items-start">
              <label className="block text-sm font-medium text-zinc-900 mb-3">
                {t("bill.electricity")}
              </label>
              <div className="w-full space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.prevUnit")}
                    </label>
                    <input
                      type="number"
                      disabled
                      className={disabledInput}
                      {...register("prevElectricityUnit", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.prevUse")}
                    </label>
                    <input
                      type="number"
                      disabled
                      className={disabledInput}
                      {...register("prevElectricityUsage", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.prevAmount")}
                    </label>
                    <input
                      type="number"
                      disabled
                      value={prevElectricityUsage * electricityRateUnit}
                      readOnly
                      className={disabledInput}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.currentUnit")}
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder={t("bill.unitPlaceholder")}
                      className={activeInput}
                      {...register("electricityUnit", {
                        valueAsNumber: true,
                        onChange: (e) =>
                          onChangeElectricityUnit(Number(e.target.value)),
                      })}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.currentUse")}
                    </label>
                    <input
                      type="number"
                      placeholder={t("bill.unitPlaceholder")}
                      readOnly
                      className={calculatedInput}
                      value={
                        (watch("electricityUnit") || 0) - prevElectricityUnit
                      }
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      {t("bill.currentAmount")}
                    </label>
                    <input
                      type="number"
                      placeholder={t("bill.amountPlaceholder")}
                      readOnly
                      className={calculatedInput}
                      {...register("electricityUsage", { valueAsNumber: true })}
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      {t("bill.perUnitRate", { rate: electricityRateUnit })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Internet */}
            <div className="flex flex-col items-start">
              <label
                htmlFor="internet"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
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

            {/* Rent */}
            <div className="flex flex-col items-start">
              <label
                htmlFor="rent"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
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

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-zinc-900 text-white font-medium text-sm rounded-xl hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t("bill.generateBill")}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-zinc-400 text-xs tracking-wider font-mono">
          COPYRIGHT © 2026 - PROUD CH
        </div>
      </div>
    </div>
  );
}
