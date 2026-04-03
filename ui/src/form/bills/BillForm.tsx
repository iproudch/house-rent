import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import BillFormProvider, { type IBillForm } from "./BillFormProvider";
import { useFormContext } from "react-hook-form";
import { useHouses } from "../../hooks/useHouses";
import MonthYearPicker from "../../MonthYearPicker";
import { usePreviousBill } from "../../hooks/usePreviousBill";
import { toBillingMonth } from "../../utils/billing-month";
import { MONTHS } from "../../constants/month";

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
  const now = new Date();
  const [billingMonth, setBillingMonth] = useState(
    `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
  );

  const houseId = watch("houseId");
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
            Bill Management
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm">
          <div className="space-y-6">
            <div className="flex flex-col items-start">
              <label
                htmlFor="houseId"
                className="block text-sm font-medium text-zinc-900 mb-2"
              >
                House
              </label>
              <select
                id="houseId"
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-200 appearance-none cursor-pointer"
                {...register("houseId", {
                  onChange: (e) => onSelectHouseUser(e.target.value),
                })}
              >
                <option value="">Select a house</option>
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
                Billing Month
              </label>
              <MonthYearPicker
                setValue={onChangeBillingMonth}
                onChange={() => {}}
              />
            </div>

            {/* Water Section */}
            <div className="flex flex-col items-start">
              <label className="block text-sm font-medium text-zinc-900 mb-3">
                Water
              </label>
              <div className="w-full space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      Previous Unit
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
                      Previous Use
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
                      Previous Amount
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
                      Current Unit
                    </label>
                    <input
                      type="number"
                      placeholder="Unit"
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
                      Current Use
                    </label>
                    <input
                      type="number"
                      placeholder="Units"
                      readOnly
                      className={calculatedInput}
                      value={
                        (watch("waterUnit") || 0) - prevWaterUnit
                      }
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      Current Amount
                    </label>
                    <input
                      type="number"
                      placeholder="Amount"
                      readOnly
                      className={calculatedInput}
                      {...register("waterUsage", { valueAsNumber: true })}
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      {waterRateUnit}฿ per unit
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Electricity Section */}
            <div className="flex flex-col items-start">
              <label className="block text-sm font-medium text-zinc-900 mb-3">
                Electricity
              </label>
              <div className="w-full space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      Previous Unit
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
                      Previous Use
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
                      Previous Amount
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
                      Current Unit
                    </label>
                    <input
                      type="number"
                      placeholder="Unit"
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
                      Current Use
                    </label>
                    <input
                      type="number"
                      placeholder="Units"
                      readOnly
                      className={calculatedInput}
                      value={
                        (watch("electricityUnit") || 0) - prevElectricityUnit
                      }
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="block text-xs font-medium text-zinc-600 mb-2">
                      Current Amount
                    </label>
                    <input
                      type="number"
                      placeholder="Amount"
                      readOnly
                      className={calculatedInput}
                      {...register("electricityUsage", { valueAsNumber: true })}
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      {electricityRateUnit}฿ per unit
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
                Internet
              </label>
              <input
                id="internet"
                type="number"
                placeholder="Enter amount"
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
                Rent
              </label>
              <input
                id="rent"
                type="number"
                placeholder="Enter amount"
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
                Generate Bill
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
